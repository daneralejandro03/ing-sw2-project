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
import { Trash2, Edit, Plus } from "lucide-react";
import orderService from "../services/orderService";
import storeService from "../../storeModule/services/storeService";
import departmentService from "../../departament/services/departmentService";
import cityService from "../../city/services/cityService";
import geoAssignmentService from "../../geoAssignment/services/geoAssignmentService";
import Swal from "sweetalert2";
import type { Order } from "../types/Order";
import type { RootState } from "../../../redux/store";
import { useSelector } from "react-redux";

const { Option } = Select;
const { Title } = Typography;

interface FullOrder extends Order {
  id: string;
  store: { id: string; name: string };
  userGuest: { id: string; name: string };
  department: string;
  city: string;
}

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<FullOrder | null>(null);
      const userId = useSelector((state: RootState) => state.auth.userId);


  const [form] = Form.useForm<
    Order & {
      storeId: string;
      departmentId: string;
      cityId: string;
    }
  >();

  useEffect(() => {
    loadAll();
    loadDepartments();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ord, sts] = await Promise.all([
        orderService.list(),
        storeService.list(),
      ]);

      const storesMap = new Map(sts.map((s: any) => [s.id, s.name]));

      const ordersTransformed: FullOrder[] = ord.map((order: any) => ({
        ...order,
        store: {
          id: order.storeId?.toString() || "",
          name: storesMap.get(order.storeId) || "Desconocida",
        },

        department: order.department || "",
        city: order.city || "",
      }));

      setOrders(ordersTransformed);
      setStores(sts.map((s: any) => ({ id: s.id, name: s.name })));
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
    });
    // preseleccionar departamento y cargar sus ciudades
    const dept = departments.find((d) => d.name === record.department);
    if (dept) {
      form.setFieldsValue({ departmentId: dept.id });
      await onDeptChange(dept.id);
      const cityObj = cities.find((c) => c.name === record.city);
      if (cityObj) form.setFieldsValue({ cityId: cityObj.id });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar orden?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await orderService.delete(id);
      Swal.fire("Eliminada", "La orden ha sido eliminada.", "success");
      loadAll();
    } catch {
      Swal.fire("Error", "No se pudo eliminar la orden.", "error");
    }
  };

  const handleFinish = async (values: any) => {
    const { storeId, departmentId, cityId, ...orderData } = values;
    const departmentName = departments.find((d) => d.id === departmentId)?.name;
    const cityName = cities.find((c) => c.id === cityId)?.name;

    const payload = {
      ...orderData,
      department: departmentName,
      city: cityName,
    };
    try {
      if (editOrder) {
        await orderService.update(payload, editOrder.id);
        Swal.fire("Actualizada", "La orden ha sido actualizada.", "success");
      } else {
        const response = await orderService.create(payload, userId, storeId);
        geoAssignmentService.createAndAsign(response.id);
        Swal.fire("Creada", "La orden ha sido creada.", "success");
      }
      setModalOpen(false);
      setEditOrder(null);
      loadAll();
      form.resetFields();
    } catch {
      Swal.fire("Error", "No se pudo guardar la orden.", "error");
    }
  };

  const columns = [
    { title: "Tienda", dataIndex: ["store", "name"], key: "store" },
    { title: "Usuario", dataIndex: ["userGuest", "name"], key: "user" },
    { title: "Estado", dataIndex: "status", key: "status" },
    { title: "Monto", dataIndex: "totalAmount", key: "totalAmount" },
    { title: "Pago", dataIndex: "paymentStatus", key: "paymentStatus" },
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
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="storeId"
                label="Tienda"
                rules={[{ required: true }]}
              >
                <Select placeholder="Selecciona tienda">
                  {stores.map((s) => (
                    <Option key={s.id} value={s.id}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="departmentId"
                label="Departamento"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Selecciona departamento"
                  onChange={onDeptChange}
                >
                  {departments.map((d) => (
                    <Option key={d.id} value={d.id}>
                      {d.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="cityId"
                label="Ciudad"
                rules={[{ required: true }]}
              >
                <Select placeholder="Selecciona ciudad">
                  {cities.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="Estado"
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
                name="totalAmount"
                label="Monto Total"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="currency"
                label="Moneda"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="paymentMethod"
                label="Método de Pago"
                rules={[{ required: true }]}
              >
                <Select placeholder="Método de pago">
                  <Option value="credit_card">Tarjeta</Option>
                  <Option value="cash">Efectivo</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="paymentStatus"
                label="Estado de Pago"
                rules={[{ required: true }]}
              >
                <Select placeholder="Estado de pago">
                  <Option value="pending">Pending</Option>
                  <Option value="paid">Paid</Option>
                  <Option value="failed">Failed</Option>
                  <Option value="refunded">Refunded</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="address1"
                label="Dirección 1"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="address2" label="Dirección 2">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="postalCode"
            label="Código Postal"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="instructions" label="Instrucciones">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderPage;
