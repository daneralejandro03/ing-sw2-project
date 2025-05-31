import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Form } from "antd";
import { Trash2, Edit } from "lucide-react";
import departmentService from "../services/departmentService";
import Swal from "sweetalert2";

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<any>(null);

  const [form] = Form.useForm();

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.list();
      setDepartments(data);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async (id: string) => {
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
        await departmentService.delete(id);
        await Swal.fire("Eliminado", "El departamento ha sido eliminado.", "success");
        loadDepartments();
      } catch (error: any) {
        await Swal.fire(
          "Error",
          error.response?.data?.message || "Error al eliminar departamento",
          "error"
        );
      }
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (editDepartment) {
        await departmentService.update(values, editDepartment.id);
        await Swal.fire("Actualizado", "El departamento ha sido actualizado.", "success");
      } else {
        await departmentService.create(values);
        await Swal.fire("Creado", "El departamento ha sido creado.", "success");
      }
      setModalOpen(false);
      setEditDepartment(null);
      loadDepartments();
      form.resetFields();
    } catch (error: any) {
      await Swal.fire("Error", "Error al guardar departamento", "error");
    }
  };

  const openModalForEdit = (record: any) => {
    setEditDepartment(record);
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
            onClick={() => deleteDepartment(record.id)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Departamentos</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditDepartment(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Crear Departamento
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={departments}
        columns={columns}
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editDepartment ? "Editar Departamento" : "Crear Departamento"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditDepartment(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editDepartment ? "Actualizar" : "Crear"}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
          >
            <Input placeholder="Nombre del departamento" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
