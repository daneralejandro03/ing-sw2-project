// src/pages/AssignmentPage.tsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  Divider,
  Typography,
} from "antd";
import {
  Trash2,
  Edit,
  Plus,
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import dayjs from "dayjs";
import assignmentService from "../services/assignmentService";
import orderService from "../../order/services/orderService";
import userService from "../../user/services/userService";
import Swal from "sweetalert2";
import type { Assignment } from "../types/Assignment";

const { Option } = Select;
const { Title } = Typography;

interface FullAssignment extends Assignment {
  id: string;
  date: Date;
  status: string;
  note: string;
  userDeliveryDriver: { id: string; name: string } | null;
  order: {
    id: string;
    address1?: string;
    city?: string;
    userGuestId?: string;
  } | null;
}

const AssignmentPage: React.FC = () => {
  const [assignments, setAssignments] = useState<FullAssignment[]>([]);
  const [orders, setOrders] = useState<
    { id: string; address1: string; city?: string; userGuestId?: string }[]
  >([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FullAssignment | null>(null);
  const [form] = Form.useForm<
    Assignment & { orderId: string; driverId: string }
  >();

  useEffect(() => {
    loadRefs(); // Primero cargar drivers y orders
  }, []);

  // Luego cargar asignaciones cuando ya estén drivers y orders
  useEffect(() => {
    if (drivers.length > 0 && orders.length > 0) {
      loadAll();
    }
  }, [drivers, orders]);

  const loadRefs = async () => {
    try {
      const [ords, usrs] = await Promise.all([
        orderService.list(),
        userService.listUsers(),
      ]);

      setOrders(
        ords.map((o: any) => ({
          id: o.id,
          address1: o.address1,
          city: o.city,
          userGuestId: o.userGuestId,
        }))
      );

      setDrivers(
        usrs
          .filter((u: any) => u.role === "680ee3fb5c022987822c83e0")
          .map((u: any) => ({
            id: u._id,
            name: `${u.name} ${u.lastName}`,
          }))
      );
    } catch {
      // ignore
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await assignmentService.list();

      const enrichedAssignments: FullAssignment[] = data.map((a: any) => {
        const driver = a.userDeliveryDriver
          ? drivers.find((d) => d.id === a.userDeliveryDriver) ?? {
              id: a.userDeliveryDriver,
              name: "—",
            }
          : null;

        const order =
          a.order && typeof a.order === "object"
            ? {
                id: a.order.id,
                address1: a.order.address1 ?? "",
                city: a.order.city ?? "",
                userGuestId:
                  a.order.userGuestId ??
                  orders.find((o) => o.id === a.order.id)?.userGuestId ??
                  "",
              }
            : a.order && typeof a.order === "string"
            ? orders.find((o) => o.id === a.order) ?? null
            : null;

        return {
          id: a.id,
          date: a.date,
          status: a.status,
          note: a.note,
          userDeliveryDriver: driver,
          order,
        };
      });

      setAssignments(enrichedAssignments);
    } finally {
      setLoading(false);
    }
  };

  const generateReportCSV = async (id: string | undefined) => {
    if (!id) return;
    const csvString = await assignmentService.reportCSV(id);
    downloadCSV(csvString);
  };

  const generateReportJSON = async (id: string | undefined) => {
    if (!id) return;
    const jsonData = await assignmentService.reportJSON(id);
    downloadJSON(jsonData);
  };

  const generateReportPDF = async (id: string | undefined) => {
    if (!id) return;
    // Si el servicio devuelve Blob
    const pdfBlob = await assignmentService.reportPDF(id);
    downloadPDF(pdfBlob);
  };

  const downloadCSV = (csvString: string, filename = "reporte.csv") => {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = (jsonObj: any, filename = "reporte.json") => {
    const jsonStr = JSON.stringify(jsonObj, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async (driverId: string) => {
    try {
      const blob = await assignmentService.reportPDF(driverId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte_${driverId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando PDF", error);
    }
  };

  const handleDelete = async (id: string) => {
    const r = await Swal.fire({
      title: "¿Eliminar asignación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!r.isConfirmed) return;
    try {
      await assignmentService.delete(id);
      Swal.fire("Eliminada", "La asignación ha sido eliminada.", "success");
      loadAll();
    } catch {
      Swal.fire("Error", "No se pudo eliminar.", "error");
    }
  };

  const openModal = (rec?: FullAssignment) => {
    if (rec) {
      setEditItem(rec);
      form.setFieldsValue({
        status: rec.status,
        note: rec.note,
        date: dayjs(rec.date),
        orderId: rec.order?.id,
        driverId: rec.userDeliveryDriver?.id,
      });
    } else {
      setEditItem(null);
      form.resetFields();
    }
    setModalOpen(true);
  };

  const handleFinish = async (values: any) => {
    const payload: Assignment = {
      status: values.status,
      note: values.note,
      date: values.date.format(),
    };
    try {
      if (editItem) {
        await assignmentService.update(payload, editItem.id);
        Swal.fire(
          "Actualizada",
          "La asignación ha sido actualizada.",
          "success"
        );
      } else {
        await assignmentService.create(
          payload,
          values.orderId,
          values.driverId
        );
        Swal.fire("Creada", "La asignación ha sido creada.", "success");
      }
      setModalOpen(false);
      loadAll();
      form.resetFields();
    } catch {
      Swal.fire("Error", "No se pudo guardar.", "error");
    }
  };

  // Función para exportar CSV
  const exportCSV = () => {
    if (assignments.length === 0) {
      Swal.fire("Aviso", "No hay asignaciones para exportar.", "info");
      return;
    }

    // Construir CSV
    const header = [
      "ID",
      "Fecha",
      "Estado",
      "Nota",
      "Repartidor",
      "Orden ID",
      "Dirección",
      "Ciudad",
      "User Guest ID",
    ];

    const rows = assignments.map((a) => [
      a.id,
      dayjs(a.date).format("DD/MM/YYYY HH:mm"),
      a.status,
      a.note || "",
      a.userDeliveryDriver?.name || "",
      a.order?.id || "",
      a.order?.address1 || "",
      a.order?.city || "",
      a.order?.userGuestId || "",
    ]);

    const csvContent = [header, ...rows]
      .map((e) => e.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // Crear Blob y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "assignments_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (d: string) => dayjs(d).format("DD/MM/YYYY HH:mm"),
    },
    { title: "Estado", dataIndex: "status", key: "status" },
    { title: "Nota", dataIndex: "note", key: "note" },
    {
      title: "Repartidor",
      key: "driver",
      render: (_: any, rec: FullAssignment) =>
        rec.userDeliveryDriver?.name || "—",
    },
    {
      title: "Orden",
      key: "order",
      render: (_: any, rec: FullAssignment) =>
        rec.order ? `${rec.order.id} - ${rec.order.address1 || ""}` : "—",
    },
    {
      title: "User Guest ID",
      key: "userGuestId",
      render: (_: any, rec: FullAssignment) => rec.order?.userGuestId || "—",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, rec: FullAssignment) => (
        <Space>
          <Button type="link" icon={<Edit />} onClick={() => openModal(rec)} />
          <Button
            danger
            type="link"
            icon={<Trash2 />}
            onClick={() => handleDelete(rec.id)}
          />
        </Space>
      ),
    },
    {
      title: "Reportes",
      key: "reports",
      render: (_: any, rec: FullAssignment) => (
        <Space>
          <Button
            type="link"
            icon={<FileSpreadsheet color="#52c41a" />}
            onClick={() => generateReportCSV(rec.userDeliveryDriver?.id)}
          />
          <Button
            type="link"
            icon={<FileJson color="#722ed1" />}
            onClick={() => generateReportJSON(rec.userDeliveryDriver?.id)}
          />
          <Button
            type="link"
            icon={<FileText color="#fa541c" />}
            onClick={() => generateReportPDF(rec.userDeliveryDriver?.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={3}>Gestión de Asignaciones</Title>
      <Space className="mb-4">
        <Button type="primary" icon={<Plus />} onClick={() => openModal()}>
          Nueva Asignación
        </Button>
        <Button icon={<Download />} onClick={exportCSV}>
          Exportar reporte CSV
        </Button>
      </Space>
      <Divider />
      <Table
        rowKey="id"
        dataSource={assignments}
        columns={columns}
        loading={loading}
        pagination={false}
        bordered
      />
      <Modal
        title={editItem ? "Editar Asignación" : "Crear Asignación"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="orderId" label="Orden" rules={[{ required: true }]}>
            <Select placeholder="Selecciona orden">
              {orders.map((o) => (
                <Option key={o.id} value={o.id}>
                  {o.id} - {o.address1}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="driverId"
            label="Repartidor"
            rules={[{ required: true }]}
          >
            <Select placeholder="Selecciona repartidor">
              {drivers.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Fecha y Hora"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="DD/MM/YYYY HH:mm"
            />
          </Form.Item>

          <Form.Item name="status" label="Estado" rules={[{ required: true }]}>
            <Select placeholder="Selecciona estado">
              <Option value="attempted">Attempted</Option>
              <Option value="assigned">Assigned</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="unassigned">Unassigned</Option>
            </Select>
          </Form.Item>

          <Form.Item name="note" label="Nota">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignmentPage;
