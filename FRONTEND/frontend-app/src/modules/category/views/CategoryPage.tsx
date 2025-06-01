import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Form } from "antd";
import { Trash2, Edit } from "lucide-react";
import categoryService from "../services/categoryService";
import Swal from "sweetalert2";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);

  const [form] = Form.useForm();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.list();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
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
        await categoryService.delete(id);
        await Swal.fire("Eliminado", "La categoría ha sido eliminada.", "success");
        loadCategories();
      } catch (error: any) {
        await Swal.fire(
          "Error",
          error.response?.data?.message || "Error al eliminar categoría",
          "error"
        );
      }
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (editCategory) {
        await categoryService.update(values, editCategory.id);
        await Swal.fire("Actualizado", "La categoría ha sido actualizada.", "success");
      } else {
        await categoryService.create(values);
        await Swal.fire("Creada", "La categoría ha sido creada.", "success");
      }
      setModalOpen(false);
      setEditCategory(null);
      loadCategories();
      form.resetFields();
    } catch (error: any) {
      await Swal.fire("Error", "Error al guardar categoría", "error");
    }
  };

  const openModalForEdit = (record: any) => {
    setEditCategory(record);
    form.setFieldsValue({ name: record.name });
    setModalOpen(true);
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    {
      title: "Acciones",
      key: "actions",
      render: (record: any) => (
        <div className="flex gap-2">
          <Button
            type="link"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => openModalForEdit(record)}
          />
          <Button
            type="link"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => deleteCategory(record.id)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditCategory(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Crear Categoría
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={categories}
        columns={columns}
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editCategory ? "Editar Categoría" : "Crear Categoría"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditCategory(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editCategory ? "Actualizar" : "Crear"}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
          >
            <Input placeholder="Nombre de la categoría" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
