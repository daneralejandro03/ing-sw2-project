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
import provisionService from "../services/provisionService";
import productService from "../../product/services/productService";
import supplierService from "../../supplier/services/supplierService";
import Swal from "sweetalert2";

const { Option } = Select;
const { Title } = Typography;

interface Provision {
  id: string;
  product: { id: string; name: string };
  supplier: { id: string; name: string };
}

interface SimpleItem {
  id: string;
  name: string;
}

const ProvisionPage: React.FC = () => {
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [products, setProducts] = useState<SimpleItem[]>([]);
  const [suppliers, setSuppliers] = useState<SimpleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Para filtro proveedores por producto
  const [filterProdId, setFilterProdId] = useState<string>();
  const [filteredSuppliers, setFilteredSuppliers] = useState<SimpleItem[]>([]);

  // Para listar productos por supplier
  const [filterSuppId, setFilterSuppId] = useState<string>();
  const [productsBySupplier, setProductsBySupplier] = useState<SimpleItem[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prov, prods, sups] = await Promise.all([
        provisionService.list(),
        productService.list(),
        supplierService.list(),
      ]);
      setProvisions(prov);
      setProducts(prods.map((p: any) => ({ id: p.id, name: p.name })));
      setSuppliers(sups.map((s: any) => ({ id: s.id, name: s.name })));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSuppliers = async () => {
    if (!filterProdId) return;
    setLoading(true);
    try {
      const data = await provisionService.listSuppliersByProductId(filterProdId);
      setFilteredSuppliers(data); // Usamos el array con {id, name}
    } finally {
      setLoading(false);
    }
  };

  const handleListProductsBySupplier = async () => {
    if (!filterSuppId) return;
    setLoading(true);
    try {
      const data = await provisionService.listProductsBySupplierId(filterSuppId);
      setProductsBySupplier(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await provisionService.create(values.productId, values.supplierId);
      Swal.fire("Creada", "La provisión ha sido creada.", "success");
      form.resetFields();
      setModalOpen(false);
      loadAll();
    } catch {
      Swal.fire("Error", "No se pudo crear la provisión.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    const r = await Swal.fire({
      title: "¿Eliminar provisión?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      await provisionService.delete(id);
      Swal.fire("Eliminada", "La provisión ha sido eliminada.", "success");
      loadAll();
    } catch {
      Swal.fire("Error", "No se pudo eliminar.", "error");
    }
  };

  const provColumns = [
    { title: "Producto", dataIndex: ["product", "name"], key: "product" },
    { title: "Proveedor", dataIndex: ["supplier", "name"], key: "supplier" },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, rec: Provision) => (
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
      <Title level={3}>Gestión de Provisiones</Title>

      <Space className="mb-4">
        <Button type="primary" icon={<Plus />} onClick={() => setModalOpen(true)}>
          Nueva Provisión
        </Button>
      </Space>

      <Divider orientation="left">Todas las Provisiones</Divider>
      <Table
        rowKey="id"
        dataSource={provisions}
        columns={provColumns}
        loading={loading}
        pagination={false}
        bordered
      />

      <Divider orientation="left">Proveedores por Producto</Divider>
      <Space className="mb-4">
        <Select
          placeholder="Selecciona producto"
          style={{ width: 200 }}
          value={filterProdId}
          onChange={setFilterProdId}
        >
          {products.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.name}
            </Option>
          ))}
        </Select>
        <Button icon={<Filter />} onClick={handleFilterSuppliers}>
          Filtrar
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={filteredSuppliers} // Aquí usamos la respuesta correcta
        columns={simpleColumns} // Usamos columnas simples para {id, name}
        loading={loading}
        pagination={false}
        bordered
      />

      <Divider orientation="left">Productos por Proveedor</Divider>
      <Space className="mb-4">
        <Select
          placeholder="Selecciona proveedor"
          style={{ width: 200 }}
          value={filterSuppId}
          onChange={setFilterSuppId}
        >
          {suppliers.map((s) => (
            <Option key={s.id} value={s.id}>
              {s.name}
            </Option>
          ))}
        </Select>
        <Button icon={<Filter />} onClick={handleListProductsBySupplier}>
          Listar
        </Button>
      </Space>
      <Table
        rowKey="id"
        dataSource={productsBySupplier}
        columns={simpleColumns}
        loading={loading}
        pagination={false}
        bordered
      />

      <Modal
        title="Crear Provisión"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Crear"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
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
          <Form.Item
            name="supplierId"
            label="Proveedor"
            rules={[{ required: true, message: "Selecciona un proveedor" }]}
          >
            <Select placeholder="Selecciona proveedor">
              {suppliers.map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProvisionPage;
