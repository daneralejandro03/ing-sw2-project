import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Row,
  Col,
  Space,
  Divider,
  Typography,
} from "antd";
import { Trash2, Edit, Plus, MapPin } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import orderService from "../services/orderService";
import assignmentService from "../../assignment/services/assignmentService";
import storeService from "../../storeModule/services/storeService";
import departmentService from "../../departament/services/departmentService";
import cityService from "../../city/services/cityService";
import geoAssignmentService from "../../geoAssignment/services/geoAssignmentService";

import type { Order } from "../types/Order";
import type { RootState } from "../../../redux/store";

const { Option } = Select;
const { Title } = Typography;

interface FullOrder extends Order {
  id: string;
  store: { id: string; name: string };
  userGuest: { id: string; name: string };
  department: string;
  city: string;
  userDeliveryDriver?: string;
}

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [stores, setStores] = useState<
    { id: string; name: string; lat: number; lng: number }[]
  >([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<FullOrder | null>(null);

  const userId = useSelector((state: RootState) => state.auth.userId)!;
  const navigate = useNavigate();
  const [form] = Form.useForm<
    Order & { storeId: string; departmentId: string; cityId: string }
  >();

  useEffect(() => {
    loadAll();
    loadDepartments();
  }, []);

  /** Carga órdenes + stores + assignments para añadir userDeliveryDriver */
  const loadAll = async () => {
    setLoading(true);
    try {
      const [ord, sts, assignments] = await Promise.all([
        orderService.list(),
        storeService.list(),
        assignmentService.list(),
      ]);
      // Mapa de stores para lookup
      const storesMap = new Map(sts.map((s: any) => [s.id, s.name]));

      const combined: FullOrder[] = ord.map((order: any) => {
        // Busco la asignación para esta orden
        const assign = assignments.find((a: any) => a.order?.id === order.id);
        return {
          ...order,
          id: order.id,
          store: {
            id: String(order.storeId),
            name: storesMap.get(order.storeId) || "Desconocida",
          },
          department: order.department || "",
          city: order.city || "",
          userDeliveryDriver: assign?.userDeliveryDriver,
        };
      });

      setOrders(combined);
      setStores(
        sts.map((s: any) => ({
          id: s.id,
          name: s.name,
          lat: s.lat,
          lng: s.lng,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.list();
      setDepartments(data.map((d: any) => ({ id: d.id, name: d.name })));
    } catch {}
  };

  const onDeptChange = async (deptId: string) => {
    form.setFieldsValue({ cityId: undefined });
    try {
      const data = await cityService.listCitiesByDepto(deptId);
      setCities(data.map((c: any) => ({ id: c.id, name: c.name })));
    } catch {}
  };

  const openModalForEdit = async (record: FullOrder) => {
    setEditOrder(record);
    form.setFieldsValue({
      ...record,
      storeId: record.store.id,
      departmentId: departments.find((d) => d.name === record.department)?.id,
      cityId: cities.find((c) => c.name === record.city)?.id,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const r = await Swal.fire({
      title: "¿Eliminar orden?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });
    if (!r.isConfirmed) return;
    try {
      await orderService.delete(id);
      Swal.fire("Eliminada", "", "success");
      loadAll();
    } catch {
      Swal.fire("Error borrando", "", "error");
    }
  };

  const handleFinish = async (values: any) => {
    const { storeId, departmentId, cityId, ...orderData } = values;
    if (!storeId) {
      return Swal.fire("Error", "Debes seleccionar una tienda", "error");
    }
    const departmentName = departments.find((d) => d.id === departmentId)?.name;
    const cityName = cities.find((c) => c.id === cityId)?.name;
    const payload = {
      ...orderData,
      department: departmentName,
      city: cityName,
    };

    try {
      setLoading(true);
      if (editOrder) {
        await orderService.update(payload, editOrder.id);
        Swal.fire("Actualizada", "", "success");
      } else {
        const response = await orderService.create(payload, userId, storeId);
        await geoAssignmentService.createAndAsign(response.id);
        Swal.fire("Creada", "", "success");
      }
      setModalOpen(false);
      setEditOrder(null);
      loadAll();
      form.resetFields();
    } catch {
      Swal.fire("Error guardando", "", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Tienda", dataIndex: ["store", "name"], key: "store" },
    { title: "Usuario", dataIndex: ["userGuest", "name"], key: "user" },
    { title: "Estado", dataIndex: "status", key: "status" },
    { title: "Monto", dataIndex: "totalAmount", key: "totalAmount" },
    { title: "Pago", dataIndex: "paymentStatus", key: "paymentStatus" },
    {
      title: "Repartidor ID",
      dataIndex: "userDeliveryDriver",
      key: "driver",
      render: (id: string) => id || "—",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, rec: FullOrder) => (
        <Space>
          <Button
            type="link"
            icon={<Edit />}
            onClick={() => openModalForEdit(rec)}
          />
          <Button
            danger
            type="link"
            icon={<Trash2 />}
            onClick={() => handleDelete(rec.id)}
          />
          <Button
            type="link"
            icon={<MapPin />}
            onClick={() =>
              navigate(`/order/${rec.id}/track`, {
                state: {
                  driverId: rec.userDeliveryDriver,
                  storeId: rec.store.id, // Aquí pasas el id directo
                  storePos: {
                    lat: stores.find((s) => s.id === rec.store.id)?.lat,
                    lng: stores.find((s) => s.id === rec.store.id)?.lng,
                  },
                },
              })
            }
          >
            Ver Ruta
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={3}>Gestión de Órdenes</Title>
      <Space className="mb-4">
        <Button
          type="primary"
          icon={<Plus />}
          onClick={() => {
            setEditOrder(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Nueva Orden
        </Button>
      </Space>
      <Divider orientation="left">Todas las Órdenes</Divider>

      <Table
        rowKey="id"
        dataSource={orders}
        columns={columns}
        loading={loading}
        pagination={false}
        bordered
      />

      <Modal
        title={editOrder ? "Editar Orden" : "Crear Orden"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditOrder(null);
          form.resetFields();
        }}
        width={800}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            {/* Columna izquierda */}
            <Col span={12}>
              <Form.Item
                name="storeId"
                label="Tienda"
                rules={[{ required: true, message: "Selecciona una tienda" }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  placeholder="Selecciona tienda"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  allowClear
                >
                  {stores.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Departamento"
                name="departmentId"
                rules={[{ required: true }]}
              >
                <Select
                  onChange={onDeptChange}
                  placeholder="Selecciona departamento"
                >
                  {departments.map((d) => (
                    <Option key={d.id} value={d.id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Ciudad"
                name="cityId"
                rules={[{ required: true }]}
              >
                <Select placeholder="Selecciona ciudad" allowClear>
                  {cities.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Dirección 1"
                name="address1"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item label="Dirección 2" name="address2">
                <Input />
              </Form.Item>

              <Form.Item
                label="Código Postal"
                name="postalCode"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            {/* Columna derecha */}
            <Col span={12}>
              <Form.Item
                label="Estado"
                name="status"
                rules={[{ required: true }]}
              >
                <Select placeholder="Selecciona estado">
                  <Option value="attempted">Attempted</Option>
                  <Option value="assigned">Assigned</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="unassigned">Unassigned</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Monto"
                name="totalAmount"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Moneda"
                name="currency"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Método de pago"
                name="paymentMethod"
                rules={[{ required: true }]}
              >
                <Select placeholder="Selecciona método de pago">
                  <Option value="credit_card">Tarjeta de crédito</Option>
                  <Option value="cash">Efectivo</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Estado de pago"
                name="paymentStatus"
                rules={[{ required: true }]}
              >
                <Select placeholder="Selecciona estado de pago">
                  <Option value="pending">Pendiente</Option>
                  <Option value="paid">Pagado</Option>
                  <Option value="failed">Fallido</Option>
                  <Option value="refunded">Reembolsado</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Instrucciones" name="instructions">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditOrder(null);
                form.resetFields();
              }}
              className="py-2 px-4 rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`py-2 px-6 rounded text-white transition duration-200
                ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
                    >
              {loading ? "Guardando..." : "Guardar Orden"}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderPage;
