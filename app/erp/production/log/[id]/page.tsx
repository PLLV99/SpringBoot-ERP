'use client'
import { Config } from "@/Config";
import { ProductionInterface } from "@/interface/ProductionInterface"
import { ProductionLogInterface } from "@/interface/ProductionLogInterface";
import axios from "axios";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Modal from "@/erp/components/Modal";

export default function ProductionLog() {
    const [production, setProduction] = useState<ProductionInterface | null>(null);
    const [productionLogs, setProductionLogs] = useState<ProductionLogInterface[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [remark, setRemark] = useState('');
    // '' means the box is empty; a state stuck at 0 cannot be cleared
    const [qty, setQty] = useState<number | ''>('');
    const [createdAt, setCreatedAt] = useState(new Date());
    const [productionLogId, setProductionLogId] = useState(0);
    const router = useRouter();
    const { id } = useParams();

    const fetchProductionLogs = useCallback(async () => {
        const url = Config.apiUrl + '/production-logs/' + id;

        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                setProductionLogs(response.data)
            }
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }, [id]);

    const fecthProduction = useCallback(async () => {
        const url = Config.apiUrl + '/productions/' + id;
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                setProduction(response.data)
            }
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }, [id]);

    useEffect(() => {
        fecthProduction();
        fetchProductionLogs();
    }, [fecthProduction, fetchProductionLogs]);

    const openModal = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
        setCreatedAt(new Date());
        setQty('');
        setRemark('');
        setProductionLogId(0);

    }

    const handleSave = async () => {
        if (qty === '' || qty <= 0) {
            Swal.fire({ title: 'Invalid quantity', text: 'Quantity must be greater than 0.', icon: 'warning' });
            return;
        }

        const url = Config.apiUrl + '/production-logs';

        try {
            const payload = {
                productionDate: createdAt.toISOString(),
                qty: qty,
                remark: remark,
                production: {
                    id: id
                }
            }
            let status;

            if (productionLogId > 0) {
                const response = await axios.put(url + '/' + productionLogId, payload);
                status = response.status;
                setProductionLogId(0);
            } else {
                const response = await axios.post(url, payload);
                status = response.status;
            }

            if (status === 200) {
                closeModal();
                fetchProductionLogs();
            }
        } catch (error) {
            Swal.fire({
                title: 'error',
                text: (error as Error).message,
                icon: 'error'
            })

        }
    }

    const handleDelete = async (id: number) => {
        const confirm = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'This action cannot be undone.',
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonColor: '#b91c1c',  // red-700
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        })

        if (confirm.isConfirmed) {
            const url = Config.apiUrl + '/production-logs/' + id;
            try {
                const response = await axios.delete(url);
                if (response.status === 200) {
                    Swal.fire({
                        title: 'Deleted',
                        text: 'Production log has been deleted.',
                        icon: 'success'
                    })
                    fetchProductionLogs();
                }
            } catch (error) {
                Swal.fire({
                    title: 'error',
                    text: (error as Error).message,
                    icon: 'error'
                })
            }
        }
    }

    const handleEdit = (productionLog: ProductionLogInterface) => {
        setShowModal(true);
        const parsed = new Date(productionLog.productionDate);
        setCreatedAt(isNaN(parsed.getTime()) ? new Date() : parsed);
        setQty(productionLog.qty ?? 0);
        setRemark(productionLog.remark ?? '');
        setProductionLogId(productionLog.id);
    }

    return (
        <div>
            <div className="mb-4">
                <button
                    className="button-back"
                    onClick={() => router.push('/erp/production')}
                >
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back
                </button>
            </div>
            <h1 className="text-2xl font-bold">Production Log for Product: {production?.name}</h1>
            <div className="flex flex-col mt-3 gap-3">
                <div>
                    <button className="button-add" onClick={openModal}>
                        <i className="fa-solid fa-plus mr-2"></i>
                        Add Entry
                    </button>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Production Date</th>
                                <th style={{ textAlign: 'right' }}>Quantity</th>
                                <th>Remark</th>
                                <th>Recorded</th>
                                <th className="w-[120px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {productionLogs.map((productionLog) => (
                                <tr key={productionLog.id}>
                                    <td>{new Date(productionLog.productionDate).toLocaleDateString()}</td>
                                    <td className="text-right">{productionLog.qty}</td>
                                    <td>{productionLog.remark}</td>
                                    {/* Server-stamped, so a back-dated entry still shows when it was keyed in */}
                                    <td className="text-sm opacity-70">
                                        {productionLog.recordedAt
                                            ? new Date(productionLog.recordedAt).toLocaleString()
                                            : '-'}
                                    </td>
                                    <td className="flex gap-2 justify-center">
                                        <button onClick={() => handleEdit(productionLog)}
                                            className="table-edit-btn table-action-btn">
                                            <i className="fa fa-pencil"></i>
                                        </button>
                                        <button onClick={() => handleDelete(productionLog.id)}
                                            className="table-delete-btn table-action-btn">
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModal && (
                <Modal title="Production Entry" onClose={closeModal}>
                    <div className="flex flex-col gap-3">
                        <div>
                            <label>Date</label>
                            {/* Defaults to today but stays editable: a night shift is often
                                keyed in the next morning, so back-dating has to be possible.
                                max stops the opposite mistake - output cannot be recorded for
                                a day that has not happened yet.
                                Clearing the field yields "", and new Date("") is an Invalid
                                Date whose toISOString() throws on the next render. */}
                            <input type="date"
                                className="input-field"
                                max={new Date().toISOString().split('T')[0]}
                                value={isNaN(createdAt.getTime()) ? '' : createdAt.toISOString().split('T')[0]}
                                onChange={(e) => setCreatedAt(e.target.value ? new Date(e.target.value) : new Date())}
                            />
                        </div>
                        <div>
                            <label>Quantity</label>
                            <input type="text"
                                className="input-field"
                                value={qty}
                                onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))} />
                        </div>
                        <div>
                            <label>Remark</label>
                            <input type="text"
                                className="input-field"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={closeModal} className="modal-btn modal-btn-cancel">
                                <i className="fas fa-times mr-2"></i>
                                Cancel
                            </button>
                            <button type="submit" onClick={handleSave} className="modal-btn modal-btn-submit">
                                <i className="fas fa-check mr-2"></i>
                                Save
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}