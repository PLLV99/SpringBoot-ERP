'use client'

import { useState, useEffect, useCallback } from "react"
import { FormulaInterface } from "@/interface/FormulaInterface"
import { ProductionInterface } from "@/interface/ProductionInterface"
import axios from "axios"
import Swal from "sweetalert2"
import { Config } from "@/Config"
import { useParams, useRouter } from "next/navigation"
import Modal from "../../components/Modal"
import { MaterialInterface } from "@/interface/MaterialInterface"


export default function Formula() {
    const router = useRouter();
    const [formulas, setFormulas] = useState<FormulaInterface[]>([]);
    const [production, setProduction] = useState<ProductionInterface | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [materials, setMaterials] = useState<MaterialInterface[]>([]);
    const [materialId, setMaterialId] = useState<number>(0);
    // '' means the box is empty. A numeric state stuck at 0 cannot be cleared:
    // typing 1 on top of it reads as "01", which is why every number field here
    // allows the empty string and is validated when the form is submitted.
    const [qty, setQty] = useState<number | ''>('');
    const [unit, setUnit] = useState<string>('');
    const { id } = useParams();

    const fetchProduction = useCallback(async () => {
        try {
            const url = Config.apiUrl + '/productions/' + id;
            const response = await axios.get(url);

            if (response.status == 200) {
                setProduction(response.data);
            }

        } catch (err: unknown) {
            let message = 'Unknown error';
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            Swal.fire({
                title: 'error',
                text: message,
                icon: 'error'
            })
        }
    }, [id]);

    const fetchMaterials = useCallback(async () => {
        try {
            const url = Config.apiUrl + '/materials';
            const response = await axios.get(url);

            if (response.status == 200) {
                setMaterials(response.data);
                // No default selection on purpose: /api/materials is ordered newest
                // first, so data[0] is simply whichever material was added last -
                // an arbitrary pick that is easy to save by accident
            }

        } catch (err: unknown) {
            let message = 'Unknown error';
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            Swal.fire({
                title: 'error',
                text: message,
                icon: 'error'
            })
        }
    }, []);

    const fetchFormulas = useCallback(async () => {
        try {
            const url = Config.apiUrl + '/formulas/' + id;
            const response = await axios.get(url);

            if (response.status == 200) {
                setFormulas(response.data);
            }

        } catch (err: unknown) {
            let message = 'Unknown error';
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            Swal.fire({
                title: 'error',
                text: message,
                icon: 'error'
            })
        }
    }, [id]);

    useEffect(() => {
        fetchProduction();
        fetchMaterials();
        fetchFormulas();
    }, [fetchProduction, fetchMaterials, fetchFormulas])

    const openModal = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);

        setMaterialId(0);
        setQty('');
        setUnit('');
    }

    // The material already declares its unit of measure, so default to it instead of
    // asking the user to retype it - two screens holding the same unit as free text is
    // how you end up with "kg", "Kg" and "กก." meaning the same thing. A real ERP would
    // take the unit from the item master and require a conversion factor to change it.
    const handleSelectMaterial = (id: number) => {
        setMaterialId(id);
        const material = materials.find(m => m.id === id);
        setUnit(material?.unitName ?? '');
    }

    const handleSave = async () => {
        if (!materialId) {
            Swal.fire({ title: 'Select a material', text: 'Choose which material this recipe uses.', icon: 'warning' });
            return;
        }
        if (qty === '' || qty <= 0) {
            Swal.fire({ title: 'Invalid quantity', text: 'Quantity must be greater than 0.', icon: 'warning' });
            return;
        }

        try {
            const url = Config.apiUrl + '/formulas'
            const payload = {
                production: {
                    id: production?.id
                }, //ใส่ ? เพื่อป้องกัน error ถ้า production ยังไม่มีข้อมูล (null/undefined)
                material: {
                    id: materialId
                },
                qty: qty,
                unit: unit
            }
            const response = await axios.post(url, payload);

            if (response.status == 200) {
                closeModal();
                fetchFormulas();
            }
        } catch (err: unknown) {
            let message = 'Unknown error';
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            Swal.fire({
                title: 'error',
                text: message,
                icon: 'error'
            })
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const confirm = await Swal.fire({
                title: 'Delete',
                text: 'Are you sure you want to delete?',
                icon: 'question',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (confirm.isConfirmed) {
                const url = Config.apiUrl + '/formulas/' + id;
                const response = await axios.delete(url);

                if (response.status == 200) {
                    fetchFormulas();
                }
            }

        } catch (err: unknown) {
            let message = 'Unknown error';
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            Swal.fire({
                title: 'error',
                text: message,
                icon: 'error'
            })
        }
    }

    return (
        <div>
            <div className="mb-4">
                <button className="button-back" onClick={() => router.push('/erp/production')}>
                    <i className="fa fa-arrow-left mr-2"></i>
                    Back to Production
                </button>
            </div>
            <h1 className="text-2xl font-bold">Bill of Materials: {production?.name}</h1>
            <div className="flex flex-col gap-2 mt-3">
                <div>
                    <button className="button-add" onClick={openModal}>
                        <i className="fas fa-plus mr-2"></i>
                        Add material
                    </button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th className="w-[100px] style={{textAlign:'right'}}">Quantity</th>
                                <th className="w-[100px]">Unit</th>
                                <th className="w-[50px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formulas.map((formula) => (
                                <tr key={formula.id}>
                                    <td>{formula.material.name}</td>
                                    <td className="text-right">{formula.qty}</td>
                                    <td>{formula.unit}</td>
                                    <td className="text-center">
                                        <button className="table-action-btn table-delete-btn"
                                            onClick={() => handleDelete(formula.id)}>
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <Modal title="Add material" onClose={closeModal}>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="material">Material</label>
                                <select id="material" value={materialId} className="input-field"
                                    onChange={(e) => handleSelectMaterial(Number(e.target.value))}>
                                    <option value={0}>-- Select a material --</option>
                                    {materials.map((material) => (
                                        <option key={material.id} value={material.id}>
                                            {material.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="qty">Quantity</label>
                                <input type="number" step="any" min="0" id="qty" value={qty} className="input-field"
                                    onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="unit">Unit</label>
                                {/* Read-only: the unit belongs to the material, not to the recipe
                                    line. Now that Quantity accepts decimals there is no reason to
                                    retype it, and a free-text copy is how "kg", "Kg" and "กก."
                                    end up meaning the same thing in one database. */}
                                <input type="text" id="unit" value={unit} className="input-field opacity-70"
                                    readOnly disabled />
                                <span className="text-xs opacity-70">
                                    Taken from the selected material. Use decimals in Quantity, e.g. 0.3
                                </span>
                            </div>
                            <div className="flex justify-end">
                                <button className="modal-btn modal-btn-submit" onClick={handleSave}>
                                    <i className="fa fa-check mr-2"></i>
                                    Save
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    )
} 