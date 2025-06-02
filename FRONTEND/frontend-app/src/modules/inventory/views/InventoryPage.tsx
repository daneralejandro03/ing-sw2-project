import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Space,
  Divider,
  Typography,
} from "antd";
import { Trash2, Plus, Filter } from "lucide-react";
import inventoryService from "../services/inventoryService";
import storeService from "../../storeModule/services/storeService";
import productService from "../../product/services/productService";
import Swal from "sweetalert2";

const { Option } = Select;
const { Title } = Typography;

const InventoryPage: React.FC = () => {
  const [inventories, setInventories] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Para filtro productos por tienda
  const [filterStoreId, setFilterStoreId] = useState<string>();
  const [productsByStore, setProductsByStore] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [inv, sts, prods] = await Promise.all([
        inventoryService.list(),
        storeService.list(),
        productService.list(),
      ]);
      setInventories(inv);
      setStores(sts);
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterProducts = async () => {
    if (!filterStoreId) return;
    setLoading(true);
    try {
      const data = await inventoryService.listProductsByStoreId(filterStoreId);
      setProductsByStore(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await inventoryService.create(values.storeId, values.productId);
      Swal.fire("Creado", "El inventario ha sido actualizado.", "success");
      form.resetFields();
      setModalOpen(false);
      loadAll();
    } catch {
      Swal.fire("Error", "No se pudo crear la entrada en inventario.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const r = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      await inventoryService.delete(id);
      Swal.fire("Eliminado", "El registro ha sido eliminado.", "success");
      loadAll();
    } catch {
      Swal.fire("Error", "No se pudo eliminar el registro.", "error");
    }
  };

  const invColumns = [
    { title: "Tienda", dataIndex: ["store", "name"], key: "store" },
    { title: "Producto", dataIndex: ["product", "name"], key: "product" },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, rec: any) => (
        <Button danger icon={<Trash2 />} onClick={() => handleDelete(rec.id)} />
      ),
    },
  ];

  const simpleColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nombre", dataIndex: "name", key: "name" },
  ];

  return (
    <div className="p-6">
      <Title level={3}>Gestión de Inventario</Title>

      <Space className="mb-4">
        <Button type="primary" icon={<Plus />} onClick={() => setModalOpen(true)}>
          Nueva Entrada
        </Button>
      </Space>

      <Divider orientation="left">Todos los Registros</Divider>
      <Table
        rowKey="id"
        dataSource={inventories}
        columns={invColumns}
        loading={loading}
        pagination={false}
        bordered
      />

      <Divider orientation="left">Productos por Tienda</Divider>
      <Space className="mb-4">
        <Select
          placeholder="Selecciona tienda"
          style={{ width: 200 }}
          value={filterStoreId}
          onChange={setFilterStoreId}
        >
          {stores.map((s) => (
            <Option key={s.id} value={s.id}>
              {s.name}
            </Option>
          ))}
        </Select>
        <Button icon={<Filter />} onClick={handleFilterProducts}>
          Filtrar
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={productsByStore}
        columns={simpleColumns}
        loading={loading}
        pagination={false}
        bordered
      />

      <Modal
        title="Añadir al Inventario"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Añadir"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="storeId"
            label="Tienda"
            rules={[{ required: true, message: "Selecciona una tienda" }]}
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
            name="productId"
            label="Producto"
            rules={[{ required: true, message: "Selecciona un producto" }]}
          >
            <Select placeholder="Selecciona producto">
              {products.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
