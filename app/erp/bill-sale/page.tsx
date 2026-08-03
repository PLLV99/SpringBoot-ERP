'use client'

import { Config } from "@/Config";
import { BillSaleInterface } from "@/interface/BillSaleInterface";
import axios from "axios";
import { useEffect, useState, useCallback } from "react"
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { BillSaleDetailInterface } from "@/interface/BillSaleDetailInterface";



export default function BillSalePage() {
    const [billSale, setBillSale] = useState<BillSaleInterface[]>([]);
    const [billSaleDetails, setBillSaleDetails] = useState<BillSaleDetailInterface[]>([]);
    const [showModal, setShowModal] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const url = Config.apiUrl + '/report/bill-sales';
            const response = await axios.get(url);

            if (response.status === 200) {
                setBillSale(response.data);
            }

        } catch (err) {
            Swal.fire({
                title: "Error",
                icon: "error",
                text: (err as Error).message
            })

        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchDataBillSaleDetail = async (billSaleId: number) => {
        try {
            const url = Config.apiUrl + '/report/bill-sale-detail/' + billSaleId;
            const response = await axios.get(url);

            if (response.status === 200) {
                setBillSaleDetails(response.data);
                setShowModal(true);
            }
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: (err as Error).message,
                icon: "error"
            });

        }
    }

    const handleDelete = async (billSale: BillSaleInterface) => {
        const buttonConfirm = await Swal.fire({
            title: 'Confirm Deletion',
            text: `Do you want to void invoice ${billSale.id}?`,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        });

        if (buttonConfirm.isConfirmed) {
            const url = Config.apiUrl + '/report/bill-sale/' + billSale.id;
            const response = await axios.delete(url)

            if (response.status === 200) {
                fetchData();
            }
        }
    }

    const handlePaid = async (billSale: BillSaleInterface) => {
        const buttonConfirm = await Swal.fire({
            title: 'Confirm Payment',
            text: `Do you want to mark invoice ${billSale.id} as paid?`,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        });

        if (buttonConfirm.isConfirmed) {
            const url = Config.apiUrl + '/report/bill-sale/' + billSale.id;
            const response = await axios.put(url);

            if (response.status === 200) {
                fetchData();
            }
        }
    }


    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Sales Invoices</h1>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Invoice No.</th>
                            <th>Date</th>
                            <th className="text-right">Total Amount</th>
                            <th className="w-[300px] text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {billSale.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    {item.status === 'paid' ? (
                                        <div className="badge-success">
                                            <i className="fa fa-check mr-2"></i>
                                            Paid
                                        </div>
                                    ) : (
                                        <div className="badge-danger">
                                            <i className="fa fa-times mr-2"></i>
                                            Void
                                        </div>
                                    )}
                                </td>
                                <td>{item.id}</td>
                                <td>{(new Date(item.createdAt)).toLocaleDateString()}</td>
                                <td>{(item.total ?? 0).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => fetchDataBillSaleDetail(item.id)}
                                        className="bg-blue-600 px-4 py-2 rounded-md text-white mr-1">
                                        <i className="fa fa-eye mr-2"></i>
                                        View Invoice
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className="bg-red-500 px-4 py-2 rounded-md text-white mr-1">
                                        <i className="fas fa-ban mr-2"></i>
                                        Void
                                    </button>
                                    <button
                                        onClick={() => handlePaid(item)}
                                        className="bg-green-600 px-4 py-2 rounded-md text-white">
                                        <i className="fa fa-check mr-2"></i>
                                        Mark as Paid
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {
                showModal && (
                    <Modal title="Invoice Details" onClose={() => setShowModal(false)} size="2xl">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Product Code</th>
                                        <th>Description</th>
                                        <th style={{ textAlign: 'right' }}>Quantity</th>
                                        <th style={{ textAlign: 'right' }}>Unit Price</th>
                                        <th style={{ textAlign: 'right' }}>Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {billSaleDetails.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.production.id}</td>
                                            <td>{item.production.name}</td>
                                            <td className="text-right">{item.quantity}</td>
                                            <td className="text-right">{(item.price ?? 0).toLocaleString()}</td>
                                            <td className="text-right">{(item.quantity * (item.price ?? 0)).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Modal>
                )
            }
        </div >
    )
}