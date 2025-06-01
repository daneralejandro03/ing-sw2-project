import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select } from "antd";
import { Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import cityService from "../services/cityService";
import departmentService from "../../departament/services/departmentService";
import type { City } from "../types/City";

const { Option } = Select;

const CitiesPage: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCity, setEditCity] = useState<any>(null);
  const [form] = Form.useForm();

  const loadCities = async () => {
    setLoading(true);
    try {
      const data = await cityService.list();
      setCities(data);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await departmentService.list();
      setDepartments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCity = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Estás seguro de eliminar esta ciudad?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await cityService.delete(id);
        await Swal.fire("Eliminado", "La ciudad ha sido eliminada.", "success");
        loadCities();
      } catch (error: any) {
        await Swal.fire("Error", error.response?.data?.message || "Error al eliminar la ciudad", "error");
      }
    }
  };

  const onFinish = async (values: any) => {
    const name: City = {
        name: values.name
    };
    const departamentId = values.departamentId;
    try {
      if (editCity) {
        alert(JSON.stringify(values))
        await cityService.update(name, editCity.id);
        await Swal.fire("Actualizado", "La ciudad ha sido actualizada.", "success");
      } else {
        await cityService.create(name, departamentId);
        await Swal.fire("Creado", "La ciudad ha sido creada.", "success");
      }
      setModalOpen(false);
      setEditCity(null);
      loadCities();
      form.resetFields();
    } catch (error: any) {
      await Swal.fire("Error", error.response?.data?.message || "Error al guardar la ciudad", "error");
    }
  };

  const openModalForEdit = (record: any) => {
    setEditCity(record);
    form.setFieldsValue({
      name: record.name,
      idDepartment: record.idDepartment?.id || record.idDepartment,
    });
    setModalOpen(true);
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    {
      title: "Departamento",
      dataIndex: "departament",
      key: "idDepartment",
      render: (dept: any) => dept?.name || "Sin departamento",
    },
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
            onClick={() => deleteCity(record.id)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadCities();
    loadDepartments();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Ciudades</h1>
        <Button
          type="primary"
          onClick={() => {
            setEditCity(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          Crear Ciudad
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={cities}
        columns={columns}
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editCity ? "Editar Ciudad" : "Crear Ciudad"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditCity(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editCity ? "Actualizar" : "Crear"}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Nombre"
            name="name"
            rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
          >
            <Input placeholder="Nombre de la ciudad" />
          </Form.Item>
          <Form.Item
            label="Departamento"
            name="departamentId"
            rules={[{ required: true, message: "Por favor selecciona un departamento" }]}
          >
            <Select placeholder="Selecciona un departamento">
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CitiesPage;
