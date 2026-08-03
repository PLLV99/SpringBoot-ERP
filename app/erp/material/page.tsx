'use client'

import { useState, useEffect, useCallback } from "react"
import Modal from "../components/Modal";
import axios from "axios";
import Swal from "sweetalert2";
import { MaterialInterface } from "@/interface/MaterialInterface";
import { Config } from "@/Config";
import { useRouter } from "next/navigation";

export default function MaterialPage() {
    const router = useRouter();
    // State for all materials
    const [materials, setMaterials] = useState<MaterialInterface[]>([])
    // State for modal visibility
    const [showModal, setShowModal] = useState<boolean>(false);
    // State for current editing material id
    const [id, setId] = useState<number>(0);
    // State for material name
    const [name, setName] = useState<string>('');
    // State for unit name
    const [unitName, setUnitName] = useState<string>('');
    // State for quantity
    // '' means the box is empty; a state stuck at 0 cannot be cleared, so typing 1
    // on top of it reads as "01"
    const [qty, setQty] = useState<number | ''>('');

    // Fetch all materials from backend
    const fetchData = useCallback(async () => {
        try {
            const url = Config.apiUrl + '/materials'
            const response = await axios.get(url);

            if (response.status === 200) {
                setMaterials(response.data);
            }
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: (err as Error).message,
                icon: 'error'
            })
        }
    }, []);

    // Fetch materials when component mounts
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Save (add or edit) material
    const handleSave = async () => {
        if (!name.trim()) {
            Swal.fire({ title: 'Name required', text: 'Enter a material name.', icon: 'warning' });
            return;
        }
        if (qty === '' || qty < 0) {
            Swal.fire({ title: 'Invalid quantity', text: 'Enter a quantity of 0 or more.', icon: 'warning' });
            return;
        }

        try {
            let url = Config.apiUrl + '/materials'
            const payload = {
                name: name,
                unitName: unitName,
                qty: qty
            }
            let status = 0;

            if (id > 0) {
                // Edit existing material
                url = Config.apiUrl + '/materials/' + id;
                const response = await axios.put(url, payload)
                status = response.status;
                setId(0);
            } else {
                // Add new material
                const response = await axios.post(url, payload);
                status = response.status;
            }

            if (status === 200) {
                fetchData();
                setShowModal(false);
                Swal.fire({
                    title: 'Success',
                    text: 'Material saved successfully!',
                    icon: 'success',
                    timer: 1000
                })
            }
        } catch (err) {
            Swal.fire(
                {
                    title: 'Error',
                    text: (err as Error).message,
                    icon: 'error'
                })
        }
    }

    // Prepare data for editing
    const handleEdit = (id: number) => {
        const material = materials.find(m => m.id === id);

        if (material) {
            setId(material.id);
            setName(material.name);
            setUnitName(material.unitName);
            setQty(material.qty);
            setShowModal(true);
        }
    }

    // Delete material
    const handleDelete = async (id: number) => {
        try {
            const confirm = await Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to delete this material?',
                icon: 'warning',
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel'
            })
            if (confirm.isConfirmed) {
                const url = Config.apiUrl + '/materials/' + id;
                const response = await axios.delete(url);
                if (response.status === 200) {
                    fetchData();
                }
            }
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: (err as Error).message,
                icon: 'error'
            })
        }
    }

    // Render UI
    return (
        <div>
            {/* Materials is reached from Production and has no sidebar entry, so it
                needs the same Back button the log and loss screens already use.
                A <button> and not a <Link>: .button-back is display:flex, which keeps a
                button at its content width but stretches an anchor across the row */}
            <div className="mb-4">
                <button className="button-back" onClick={() => router.push('/erp/production')}>
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back to Production
                </button>
            </div>
            {/* Page title */}
            <h1 className="text-2xl font-bold mb-5">Materials</h1>
            {/* Add material button */}
            <button onClick={() => {
                setShowModal(true);
                setName('');
                setUnitName('');
                setQty('');
                setId(0);
            }} className="button-add">
                <i className="fa fa-plus mr-2"></i>
                Add Material
            </button>
            {/* Materials table */}
            <div className="table-container mt-5">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th className="w-[120px]">Unit</th>
                            <th className="w-[120px]">Quantity</th>
                            <th className="w-[120px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(material => (
                            <tr key={material.id}>
                                <td>{material.name}</td>
                                <td>{material.unitName}</td>
                                <td>{material.qty}</td>
                                <td className="flex gap-2">
                                    {/* Edit button */}
                                    <button onClick={() => handleEdit(material.id)}
                                        className="table-edit-btn table-action-btn">
                                        <i className="fa fa-pencil"></i>
                                    </button>
                                    {/* Delete button */}
                                    <button onClick={() => handleDelete(material.id)}
                                        className="table-delete-btn table-action-btn">
                                        <i className="fa fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Modal for add/edit material */}
            {showModal && (
                <Modal title="Material" onClose={() => setShowModal(false)}>
                    <div className="flex flex-col gap-2">
                        <div>
                            <label>Material Name</label>
                            <input type="text" value={name} className="input-field"
                                onChange={(e) => setName(e.target.value)} />
                        </div>
                        {/* Quantity before Unit, matching the Formula screen: the pair
                            reads as one measurement ("500 kg"), so the number comes first */}
                        <div>
                            <label>Quantity</label>
                            <input type="text" value={qty} className="input-field"
                                onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))} />
                        </div>
                        <div>
                            <label>Unit</label>
                            <input type="text" value={unitName} className="input-field"
                                onChange={(e) => setUnitName(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2">
                            {/* Cancel button */}
                            <button type="button" onClick={() => setShowModal(false)}
                                className="modal-btn modal-btn-cancel">
                                <i className="fas fa-times mr-2"></i>
                                Cancel
                            </button>
                            {/* Save button */}
                            <button type="submit" onClick={handleSave}
                                className="modal-btn modal-btn-submit">
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