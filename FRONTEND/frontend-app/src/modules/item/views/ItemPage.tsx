import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputNumber, Select } from "antd";
import { Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import itemService from "../services/itemService";
import orderService from "../../order/services/orderService";
import productService from "../../product/services/productService";

const { Option } = Select;

const ItemsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form] = Form.useForm();

  // Carga inicial de datos
  const loadData = async () => {
    setLoading(true);
    try {
      const [itm, ord, prod] = await Promise.all([
        itemService.list(),
        orderService.list(),
        productService.list(),
      ]);

      setItems(itm);

      setOrders(
        ord.map((o: any) => ({
          id: o.id || o._id,
          label: o.id || o._id,
        }))
      );

      setProducts(
        prod.map((p: any) => ({
          id: p.id,
          label: p.name,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Eliminar ítem
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar ítem?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await itemService.delete(id);
      Swal.fire("Eliminado", "El ítem ha sido eliminado.", "success");
      loadData();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el ítem.", "error");
    }
  };

  // Enviar formulario para crear o actualizar
  const onFinish = async (values: any) => {
    try {
      if (editItem) {
        await itemService.update({ quantity: values.quantity }, editItem.id);
        Swal.fire("Actualizado", "Ítem actualizado.", "success");
      } else {
        await itemService.create(
          { quantity: values.quantity },
          values.orderId,
          values.productId
        );
        Swal.fire("Creado", "Ítem creado.", "success");
      }
      setModalOpen(false);
      setEditItem(null);
      loadData();
      form.resetFields();
    } catch {
      Swal.fire("Error", "Error al guardar ítem.", "error");
    }
  };

  // Abrir modal para editar
  const openModalForEdit = (record: any) => {
    setEditItem(record);
    form.setFieldsValue({
      orderId: record.order?.id,
      productId: record.productId,
      quantity: record.quantity,
    });
    setModalOpen(true);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: ["order", "id"],
      key: "order",
      render: (text: string) => text || "N/A",
    },
    {
      title: "Product",
      key: "product",
      render: (_: any, rec: any) => {
        // Busca el nombre del producto en la lista de productos según productId
        const product = products.find((p) => p.id === rec.productId);
        return product ? product.label : rec.name || "N/A";
      },
    },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, rec: any) => (
        <div className="flex gap-2">
          <Button type="link" icon={<Edit />} onClick={() => openModalForEdit(rec)} />
          <Button
            type="link"
            danger
            icon={<Trash2 />}
            onClick={() => handleDelete(rec.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Ítems</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditItem(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Crear Ítem
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={items}
        columns={columns}
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editItem ? "Editar Ítem" : "Crear Ítem"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditItem(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editItem ? "Actualizar" : "Crear"}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="orderId"
            label="Order"
            rules={[{ required: true, message: "Selecciona una orden" }]}
          >
            <Select placeholder="Selecciona orden">
              {orders.map((o) => (
                <Option key={o.id} value={o.id}>
                  {o.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="productId"
            label="Product"
            rules={[{ required: true, message: "Selecciona un producto" }]}
          >
            <Select placeholder="Selecciona producto">
              {products.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Cantidad"
            rules={[{ required: true, message: "Ingresa la cantidad" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ItemsPage;
