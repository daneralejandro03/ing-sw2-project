// src/pages/StoresPage.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";
import { Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import storeService from "../services/storeService";
import cityService from "../../city/services/cityService";
import type { Store } from "../types/Store";

const { Option } = Select;

type MyJwtPayload = {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
};

const StoresPage: React.FC = () => {
  const [stores, setStores] = useState<(Store & { id: string; city: any })[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStore, setEditStore] = useState<any>(null);
  const [form] = Form.useForm();

  const token = localStorage.getItem("token") || "";
  const decoded = token ? jwtDecode<MyJwtPayload>(token) : null;
  const userId = decoded?.id ?? "";

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await storeService.list();
      setStores(data);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const data = await cityService.list();
      setCities(data.map((c: any) => ({ id: String(c.id), name: c.name })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStore = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Seguro que deseas eliminar esta tienda?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await storeService.delete(id);
      Swal.fire("Eliminada", "La tienda ha sido eliminada.", "success");
      loadStores();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo eliminar",
        "error"
      );
    }
  };

  const onFinish = async (values: any) => {
    const payload: Store = {
      name: values.name,
      code: values.code,
      address: values.address,
      postalCode: values.postalCode,
      longitude: values.longitude,
      latitude: values.latitude,
      capacity: values.capacity,
      state: values.state,
    };
    try {
      if (editStore) {
        await storeService.update(payload, editStore.id);
        Swal.fire("Actualizada", "La tienda ha sido actualizada.", "success");
      } else {
        await storeService.create(payload, values.cityId, userId);
        Swal.fire("Creada", "La tienda ha sido creada.", "success");
      }
      setModalOpen(false);
      setEditStore(null);
      loadStores();
      form.resetFields();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo guardar",
        "error"
      );
    }
  };

  const openModal = (store?: any) => {
    if (store) {
      setEditStore(store);
      form.setFieldsValue({
        name: store.name,
        code: store.code,
        address: store.address,
        postalCode: store.postalCode,
        longitude: store.longitude,
        latitude: store.latitude,
        capacity: store.capacity,
        state: store.state,
        cityId: String(store.city.id),
      });
    } else {
      setEditStore(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Código", dataIndex: "code", key: "code" },
    { title: "Dirección", dataIndex: "address", key: "address" },
    { title: "CP", dataIndex: "postalCode", key: "postalCode" },
    {
      title: "Ubicación",
      key: "coords",
      render: (_: any, rec: any) => `${rec.latitude}, ${rec.longitude}`,
    },
    { title: "Capacidad", dataIndex: "capacity", key: "capacity" },
    { title: "Estado", dataIndex: "state", key: "state" },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
      render: (c: any) => c.name,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, rec: any) => (
        <div className="flex gap-2">
          <Button type="link" icon={<Edit />} onClick={() => openModal(rec)} />
          <Button
            type="link"
            danger
            icon={<Trash2 />}
            onClick={() => deleteStore(rec.id)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadStores();
    loadCities();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Tiendas</h1>
        <Button type="primary" onClick={() => openModal()}>
          Crear Tienda
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={stores}
        columns={columns}
        loading={loading}
        bordered
        pagination={false}
      />

      <Modal
        title={editStore ? "Editar Tienda" : "Crear Tienda"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editStore ? "Actualizar" : "Crear"}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="code" label="Código" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="address" label="Dirección" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="postalCode" label="Código Postal" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="cityId" label="Ciudad" rules={[{ required: true }]}>
                <Select placeholder="Selecciona ciudad">
                  {cities.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="latitude" label="Latitud" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="longitude" label="Longitud" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="capacity" label="Capacidad" rules={[{ required: true }]}>
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="state" label="Estado" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default StoresPage;
