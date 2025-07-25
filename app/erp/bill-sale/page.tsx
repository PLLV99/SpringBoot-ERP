'use client'

import { Config } from "@/app/Config";
import { BillSaleInterface } from "@/app/interface/BillSaleInterface";
import axios from "axios";
import { useEffect, useState } from "react"
import Swal from "sweetalert2";
import Modal from "../components/Modal";
import { BillSaleDetailInterface } from "@/app/interface/BillSaleDetailInterface";



export default function BillSalePage() {
    const [billSale, setBillSale] = useState<BillSaleInterface[]>([]);
    const [billSaleDetails, setBillSaleDetails] = useState<BillSaleDetailInterface[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const url = Config.apiUrl + '/api/report/bill-sales';
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
    }
    const fetchDataBillSaleDetail = async (billSaleId: number) => {
        try {
            const url = Config.apiUrl + '/api/report/bill-sale-detail/' + billSaleId;
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
            const url = Config.apiUrl + '/api/report/bill-sale/' + billSale.id;
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
            const url = Config.apiUrl + '/api/report/bill-sale/' + billSale.id;
            const response = await axios.put(url);

            if (response.status === 200) {
                fetchData();
            }
        }
    }


    return (
        <div>
            <h1>Sales Invoices</h1>
            <div className="table-container">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Invoice No.</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th className="w-[80px]"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {billSale.map((billSale) => (
                            <tr key={billSale.id}>
                                <td>
                                    {billSale.status === 'paid' ? (
                                        <div className="bg-green-600 text-white px-2 py-1 rounded-xl text-center">
                                            <i></i>
                                            Paid
                                        </div>
                                    ) : (
                                        <div className="bg-red-600 text-white px-2 py-1 rounded-xl text-center">
                                            <i className="fa fa-times mr-2"></i>
                                            Void
                                        </div>
                                    )}
                                </td>
                                <td>{billSale.id}</td>
                                <td>{(new Date(billSale.createdAt)).toLocaleDateString()}</td>
                                <td>{billSale.total.toLocaleString()}</td>
                                <td>
                                    <button onClick={() => fetchDataBillSaleDetail(billSale.id)}
                                        className="bg-blue-600 px-4 py-2 rounded-md text-white mr-1">
                                        <i className="fa fa-eye mr-2"></i>
                                        View Invoice
                                    </button>
                                    <button
                                        onClick={() => handleDelete(billSale)}
                                        className="bg-red-500 px-4 py-2 rounded-md text-white mr-1">
                                        <i className="fas fa-ban mr-2"></i>
                                        Void
                                    </button>
                                    <button
                                        onClick={() => handlePaid(billSale)}
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
            {showModal && (
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
                                        <td className="text-right">{item.price.toLocaleString()}</td>
                                        <td className="text-right">{(item.quantity * item.price).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Modal>
            )}
        </div>
    )
}