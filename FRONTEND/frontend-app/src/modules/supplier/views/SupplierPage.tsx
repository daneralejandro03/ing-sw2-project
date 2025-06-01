import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Form } from "antd";
import { Trash2, Edit } from "lucide-react";
import supplierService from "../services/supplierService";
import Swal from "sweetalert2";

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<any>(null);

  const [form] = Form.useForm();

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.list();
      setSuppliers(data);
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
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
        await supplierService.delete(id);
        await Swal.fire("Eliminado", "El proveedor ha sido eliminado.", "success");
        loadSuppliers();
      } catch (error: any) {
        await Swal.fire(
          "Error",
          error.response?.data?.message || "Error al eliminar proveedor",
          "error"
        );
      }
    }
  };

  const onFinish = async (values: any) => {
    try {
      if (editSupplier) {
        await supplierService.update(values, editSupplier.id);
        await Swal.fire("Actualizado", "El proveedor ha sido actualizado.", "success");
      } else {
        await supplierService.create(values);
        await Swal.fire("Creado", "El proveedor ha sido creado.", "success");
      }
      setModalOpen(false);
      setEditSupplier(null);
      loadSuppliers();
      form.resetFields();
    } catch (error: any) {
      await Swal.fire("Error", "Error al guardar proveedor", "error");
    }
  };

  const openModalForEdit = (record: any) => {
    setEditSupplier(record);
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
            onClick={() => deleteSupplier(record.id)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadSuppliers();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Proveedores</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditSupplier(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Crear Proveedor
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={suppliers}
        columns={columns}
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editSupplier ? "Editar Proveedor" : "Crear Proveedor"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditSupplier(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editSupplier ? "Actualizar" : "Crear"}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
          >
            <Input placeholder="Nombre del proveedor" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersPage;
