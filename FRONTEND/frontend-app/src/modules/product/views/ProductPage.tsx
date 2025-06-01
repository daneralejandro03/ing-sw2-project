import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Switch,
} from "antd";
import { Trash2, Edit } from "lucide-react";
import productService from "../services/productService";
import categoryService from "../../category/services/categoryService";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import type { Product } from "../types/Product";

const { Option } = Select;

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form] = Form.useForm();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.list();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await productService.delete(id);
        await Swal.fire(
          "Eliminado",
          "El producto ha sido eliminado.",
          "success"
        );
        loadProducts();
      } catch (error: any) {
        await Swal.fire(
          "Error",
          error.response?.data?.message || "Error al eliminar producto",
          "error"
        );
      }
    }
  };

  const onFinish = async (values: any) => {
    const formattedDateEntry = dayjs(values.dateEntry).format("DD/MM/YYYY");
    const formattedExpirationDate = dayjs(values.expirationDate).format(
      "DD/MM/YYYY"
    );

    const payload: Product = {
      name: values.name,
      description: values.description,
      unitPrice: values.unitPrice,
      stock: values.stock,
      levelReorder: values.levelReorder,
      sku: values.sku,
      barcode: values.barcode,
      dateEntry: formattedDateEntry,
      expirationDate: formattedExpirationDate,
      weightKg: values.weightKg,
      lengthCm: values.lengthCm,
      widthCm: values.widthCm,
      heightCm: values.heightCm,
      isFragile: values.isFragile,
      requiresRefurbishment: values.requiresRefurbishment,
      status: values.status,
    };

    try {
      if (editProduct) {
        await productService.update(payload, editProduct.id);
        await Swal.fire(
          "Actualizado",
          "El producto ha sido actualizado.",
          "success"
        );
      } else {
        await productService.create(payload, values.categoryId);
        await Swal.fire("Creado", "El producto ha sido creado.", "success");
      }
      setModalOpen(false);
      setEditProduct(null);
      loadProducts();
      form.resetFields();
    } catch (error: any) {
      await Swal.fire("Error", "Error al guardar producto", "error");
    }
  };

  const openModalForEdit = (record: any) => {
    setEditProduct(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      unitPrice: record.unitPrice,
      stock: record.stock,
      levelReorder: record.levelReorder,
      sku: record.sku,
      barcode: record.barcode,
      dateEntry: record.dateEntry ? dayjs(record.dateEntry) : null,
      expirationDate: record.expirationDate
        ? dayjs(record.expirationDate)
        : null,
      weightKg: record.weightKg,
      lengthCm: record.lengthCm,
      widthCm: record.widthCm,
      heightCm: record.heightCm,
      isFragile: record.isFragile,
      requiresRefurbishment: record.requiresRefurbishment,
      status: record.status,
      categoryId: record.category.id,
    });
    setModalOpen(true);
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Precio", dataIndex: "unitPrice", key: "unitPrice" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
    {
      title: "Categoría",
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, rec: any) => (
        <div className="flex gap-2">
          <Button
            type="link"
            icon={<Edit />}
            onClick={() => openModalForEdit(rec)}
          />
          <Button
            danger
            type="link"
            icon={<Trash2 />}
            onClick={() => deleteProduct(rec.id)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Productos</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditProduct(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Crear Producto
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={products}
        columns={columns}
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editProduct ? "Editar Producto" : "Crear Producto"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditProduct(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editProduct ? "Actualizar" : "Crear"}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isFragile: false,
            requiresRefurbishment: false,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Descripción"
                rules={[{ required: true }]}
              >
                <Input.TextArea />
              </Form.Item>
              <Form.Item
                name="unitPrice"
                label="Precio Unitario"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="stock"
                label="Stock"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="levelReorder"
                label="Nivel Reorden"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item
                name="barcode"
                label="Código de Barras"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="dateEntry"
                label="Fecha de Entrada"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="expirationDate"
                label="Fecha de Expiración"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="weightKg"
                label="Peso (kg)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="lengthCm"
                label="Largo (cm)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="widthCm"
                label="Ancho (cm)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="heightCm"
                label="Alto (cm)"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                name="isFragile"
                label="Frágil"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="requiresRefurbishment"
                label="Requiere "
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="status"
                label="Estado"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="categoryId"
                label="Categoría"
                rules={[{ required: true }]}
              >
                <Select placeholder="Selecciona categoría">
                  {categories.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
