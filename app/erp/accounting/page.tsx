'use client'

import { ErrorInterface } from "@/interface/ErrorInterface";
import { ProductionInterface } from "@/interface/ProductionInterface";
import { useEffect, useState, useCallback } from "react"
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { Config } from "@/Config";
import axios from "axios";

export default function AccountingPage() {
    const [productions, setProductions] = useState<ProductionInterface[]>([]);
    const [id, setId] = useState<number>(0);
    // '' represents an empty input box; a number is a real price
    const [price, setPrice] = useState<number | ''>(0);
    const [name, setName] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false)

    const fetchProductions = useCallback(async () => {
        try {
            const url = `${Config.apiUrl}/productions`;
            const response = await axios.get(url);

            if (response.status === 200) {
                setProductions(response.data);
            }
        } catch (err: unknown) {
            Swal.fire({
                title: 'Error',
                text: (err as ErrorInterface).message,
                icon: 'error'
            });
        }
    }, []);

    useEffect(() => {
        fetchProductions();
    }, [fetchProductions]);

    const handleUpdatePrice = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // An empty or negative price would be saved as-is; the API trusts this value
        if (price === '' || price < 0) {
            Swal.fire({
                title: 'Invalid price',
                text: 'Enter a price of 0 or more before saving.',
                icon: 'warning'
            });
            return;
        }

        try {
            const payload = { price };
            const url = `${Config.apiUrl}/productions/updatePrice/${id}`;
            const response = await axios.put(url, payload);

            if (response.status === 200) {
                fetchProductions();
                closeModal();
            }
        }
        catch (err: unknown) {
            Swal.fire({
                title: 'error',
                text: (err as ErrorInterface).message,
                icon: 'error'
            })
        }
    }

    // Clearing the box gives '', and parseFloat('') is NaN - which React rejects as an
    // input value. Keep the empty string in state instead, so the field can be cleared
    // and retyped; handleUpdatePrice is what decides an empty box is not submittable.
    const handleChangePrice = (value: string) => {
        if (value === '') {
            setPrice('');
            return;
        }
        const parsed = parseFloat(value);
        setPrice(Number.isNaN(parsed) ? '' : parsed);
    }

    const openModal = (id: number) => {
        const production = productions.find(item => item.id === id);
        if (production) {
            setId(id);
            // price is null until it has been set for the first time
            setPrice(production.price ?? '');
            setName(production.name);
            setShowModal(true);
        }
    }

    const closeModal = () => {
        setShowModal(false);
    }

    return (
        <>
            <div className="text-xl font-bold mb-4">Accounting</div>
            <section>
                <h2 className="text-lg font-semibold">Product Pricing</h2>

                <div className="table-container mt-4">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th className="w-[100px] text-right">Price</th>
                                <th className="w-[140px] text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productions.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td className="text-right">{item.price ?? 0}</td>
                                    <td className="flex justify-center">
                                        <button
                                            className="table-edit-btn table-action-btn"
                                            onClick={() => openModal(item.id)}>
                                            <i className="fa fa-pencil" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {showModal && (
                <Modal title="Set Selling Price" onClose={closeModal}>
                    <form className="flex flex-col gap-4" onSubmit={handleUpdatePrice}>
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Name</label>
                            <input value={name} disabled className="input-field input-disabled w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Selling Price</label>
                            <input type="number"
                                value={price}
                                onChange={(e) => handleChangePrice(e.target.value)}
                                className="input-field w-full"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="modal-btn modal-btn-cancel"
                            >
                                <i className="fas fa-times mr-2" />
                                Cancel
                            </button>
                            <button type="submit" className="modal-btn modal-btn-submit">
                                <i className="fas fa-check mr-2" />
                                Save
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
}