'use client'

import React, { useCallback, useEffect, useState } from "react"
import Modal from "../components/Modal"
import { Config } from "@/Config";
import Swal from "sweetalert2";
import axios from "axios";
import { StoreInterface } from "@/interface/StoreInterface";
import { ProductionInterface } from "@/interface/ProductionInterface";
import { StoreImportInterface } from "@/interface/StoreImportInterface";
import { TransferStoreInterface } from "@/interface/TransferStoreInterface";


// --- State ----
export default function InventoryPage() {
    // Inventory states
    const [stores, setStores] = useState<StoreInterface[]>([]);
    const [productions, setProductions] = useState<ProductionInterface[]>([]);
    const [storeImports, setStoreImports] = useState<StoreImportInterface[]>([])
    const [transferStores, setTransferStores] = useState<TransferStoreInterface[]>([]);

    // Form states
    const [id, setId] = useState<number>(0);
    const [name, setName] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [remark, setRemark] = useState<string>('');
    const [productionId, setProductionId] = useState<number>(0);

    // Import modal states
    const [showModalImport, setShowModalImport] = useState(false);
    const [totalProductionLog, setTotalProductionLog] = useState<number>(0);
    const [totalProductionLoss, setTotalProductionLoss] = useState<number>(0);
    const [totalProductionFree, setTotalProductionFree] = useState<number>(0);
    const [remarkImport, setRemarkImport] = useState<string>('');
    // '' means the box is empty; a state stuck at 0 cannot be cleared
    const [qtyImport, setQtyImport] = useState<number | ''>('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showModalHistory, setShowModalHistory] = useState(false);
    const [showModalTransfer, setShowModalTransfer] = useState(false);
    const [showModalHistoryTransfer, setShowModalHistoryTransfer] = useState(false);

    // Transfer modal states
    const [fromStoreId, setFromStoreId] = useState<number>(0);
    const [toStoreId, setToStoreId] = useState<number>(0);
    const [qtyTransfer, setQtyTransfer] = useState<number | ''>('');
    const [remarkTransfer, setRemarkTransfer] = useState<string>('');
    const [transferCreatedAt, setTransferCreatedAt] = useState<Date>(new Date());
    const [fromStoreName, setFromStoreName] = useState<string>('');
    const [productionTransfer, setProductionTransfer] = useState<number>(0);

    // --- API Functions ---
    const fetchStores = useCallback(async () => {
        const url = Config.apiUrl + '/store';
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                setStores(response.data);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: (error as Error).message || 'Failed to fetch stores'
            })

        }
    }, []);

    const fetchProductions = useCallback(async () => {
        const url = Config.apiUrl + '/productions';
        try {
            const response = await axios.get(url);

            if (response.status === 200) {
                setProductions(response.data);
                if (response.data.length > 0) {
                    changeProduction(response.data[0].id);// Set default production
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: (error as Error).message
            })

        }
    }, []); // Note: changeProduction is not included here to avoid complexity, but in a larger app, it should be.

    // ---useEffect ---
    useEffect(() => {
        fetchStores();
        fetchProductions();
    }, [fetchStores, fetchProductions])

    const fetchStoreImports = async (id: number) => {
        try {
            const url = `${Config.apiUrl}/store/import/${id}`;
            const response = await axios.get(url);

            if (response.status === 200) {
                setStoreImports(response.data);
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: (error as Error).message

            })

        }
    }

    const fetchDataTransferStore = async () => {
        try {
            const url = Config.apiUrl + '/transfer-stock';
            const response = await axios.get(url);

            if (response.status === 200) {
                setTransferStores(response.data);
            }

        } catch (error) {
            Swal.fire({
                title: 'error',
                icon: 'error',
                text: (error as Error).message
            })
        }
    }


    // --- Handler Functions ---
    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const data = {
                name: name,
                address: address,
                remark: remark
            }

            let status = 0;
            let url = Config.apiUrl + '/store';

            if (id > 0) {
                // Update existing store
                url += `/${id}`; // url = url + '/' + id;
                const response = await axios.put(url, data);
                status = response.status;
                setId(0);
            } else {
                const response = await axios.post(url, data);
                status = response.status;
            }

            if (status === 200) {
                setShowModal(false);
                fetchStores();
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: (error as Error).message || 'Failed to save store'
            })
        }
    }

    const handleDelete = async (id: number) => {
        const button = await Swal.fire({
            title: 'Delete Confirmation',
            text: 'Are you sure you want to delete this record?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        });
        if (button.isConfirmed) {
            const url = Config.apiUrl + '/store/' + id;
            try {
                const response = await axios.delete(url);
                if (response.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Record deleted successfully'
                    });
                    fetchStores();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: (error as Error).message || 'Failed to delete record'
                });
            }
        }
    }

    const handleEdit = (store: StoreInterface) => {
        setId(store.id);
        setName(store.name);
        setAddress(store.address);
        setRemark(store.remark);
        setShowModal(true);
    }

    const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (qtyImport === '' || qtyImport <= 0) {
            Swal.fire({ title: 'Invalid quantity', text: 'Enter how many units to bring into the warehouse.', icon: 'warning' });
            return;
        }

        try {
            const data = {
                production: {
                    id: productionId
                },
                store: {
                    id: id
                },
                qty: qtyImport,
                remark: remarkImport,
                importDate: new Date().toISOString()
            }

            const url = Config.apiUrl + '/store/import';
            const response = await axios.post(url, data);

            if (response.status === 200) {
                closeModalImport();

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Stock imported successfully',
                    timer: 1500
                })
            }

        } catch (error) {
            Swal.fire({
                title: 'error',
                icon: 'error',
                text: (error as Error).message
            })
        }
    }

    const handleDeleteImport = async (id: number, storeId: number) => {
        const button = await Swal.fire({
            title: 'Delete Confirmation',
            text: 'Are you sure you want to delete this record?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true
        })

        if (button.isConfirmed) {
            const url = Config.apiUrl + '/store/import/' + id;

            try {
                await axios.delete(url);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: (error as Error).message
                })
            }
        }
        openModalHistory(storeId);

    }

    const changeProduction = async (id: number) => {
        setProductionId(id);
        try {
            const url = Config.apiUrl + '/store/data-for-import/' + id;
            const response = await axios.get(url);

            if (response.status === 200) {
                const data = response.data;
                const log = data.totalProductionLog ?? 0;
                const loss = data.totalProductionLoss ?? 0;
                const free = log - loss;

                setTotalProductionLog(log);
                setTotalProductionLoss(loss);
                setTotalProductionFree(free);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: (error as Error).message || 'Failed to fetch production details'
            });
        }
    }

    const handleTransferStock = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // The selects start empty, so 0 means "nothing chosen". Without this the request
        // goes out referencing store/product id 0, which the database rejects as a
        // foreign key violation - an error that says nothing about what the user did wrong.
        if (!toStoreId) {
            Swal.fire({ title: 'Select a destination', text: 'Choose which warehouse to transfer to.', icon: 'warning' });
            return;
        }
        if (toStoreId === fromStoreId) {
            Swal.fire({ title: 'Same warehouse', text: 'Choose a different warehouse to transfer to.', icon: 'warning' });
            return;
        }
        if (!productionTransfer) {
            Swal.fire({ title: 'Select a product', text: 'Choose which product to transfer.', icon: 'warning' });
            return;
        }
        if (qtyTransfer === '' || qtyTransfer <= 0) {
            Swal.fire({ title: 'Invalid quantity', text: 'Enter how many units to transfer.', icon: 'warning' });
            return;
        }

        try {
            const payload = {
                fromStore: {
                    id: fromStoreId
                },
                toStore: {
                    id: toStoreId
                },
                production: {
                    id: productionTransfer
                },
                quantity: qtyTransfer,
                remark: remarkTransfer,
                createdAt: transferCreatedAt.toISOString()
            }
            const url = Config.apiUrl + '/transfer-stock'
            const response = await axios.post(url, payload);

            if (response.status === 200) {
                closeModalTransfer();

                Swal.fire({
                    title: 'Success',
                    text: 'Product transfer completed',
                    icon: 'success',
                    timer: 500
                })
            }

        } catch (error) {
            Swal.fire({
                title: 'error',
                icon: 'error',
                text: (error as Error).message
            })
        }
    }

    const handleDeleteTransfer = async (id: number) => {
        try {
            const button = await Swal.fire({
                title: 'Delete Transfer Record',
                text: 'Are you sure you want to delete?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it',
                cancelButtonText: 'Cancel'
            });

            if (button.isConfirmed) {
                const url = Config.apiUrl + '/transfer-stock/' + id
                const response = await axios.delete(url);
                if (response.status === 200) {
                    fetchDataTransferStore();
                    Swal.fire({
                        title: 'Deleted',
                        text: 'The transfer record has been deleted successfully.',
                        icon: 'success',
                        timer: 1000
                    });
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                icon: 'error',
                text: (error as Error).message
            });
        }
    }


    // --- Modal Functions ---
    const openModal = () => {
        setShowModal(true);
    }
    const openModalImport = (id: number) => {
        setShowModalImport(true);
        setId(id);
    }

    const closeModalImport = () => {
        setShowModalImport(false);
    }



    const openModalHistory = (id: number) => {
        setShowModalHistory(true);
        setId(id);
        fetchStoreImports(id);
    }

    const closeModalHistory = () => {
        setShowModalHistory(false);
    }


    const openModalTransfer = (fromStoreName: string, fromStoreId: number) => {
        setShowModalTransfer(true);
        setFromStoreName(fromStoreName);
        setFromStoreId(fromStoreId);
        // Clear the rest so a previous transfer never leaks into this one
        setToStoreId(0);
        setProductionTransfer(0);
        setQtyTransfer('');
        setRemarkTransfer('');
        setTransferCreatedAt(new Date());
    }

    const closeModalTransfer = () => {
        setShowModalTransfer(false);
        setFromStoreId(0);
        setToStoreId(0);
        setQtyTransfer('');
        setRemarkTransfer('');
        setTransferCreatedAt(new Date());
        // 0, not productions[0].id: reading [0] throws when no product exists yet
        setProductionTransfer(0);
    }

    const openModalHistoryTransfer = () => {
        setShowModalHistoryTransfer(true);
        fetchDataTransferStore();
    }

    const closeModalHistoryTransfer = () => {
        setShowModalHistoryTransfer(false);
    }


    return (
        <div>
            <h1 className="text-2xl font-bold">Inventory</h1>
            <div className="flex flex-col gap-2 mt-3">
                <div className="flex gap-2">
                    <button className="button-add" onClick={openModal}>
                        <i className="fa-solid fa-plus me-2"></i>
                        Add Inventory
                    </button>
                    <button className="button-add" onClick={openModalHistoryTransfer}>
                        <i className="fa-solid fa-exchange-alt me-2"></i>
                        Transfer History
                    </button>
                </div>

                <div className="table-container mt-3">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Inventory Name</th>
                                <th>Address</th>
                                <th>Remark</th>
                                <th className="w-[120px]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((store) => (
                                <tr key={store.id}>
                                    <td>{store.name}</td>
                                    <td>{store.address}</td>
                                    <td>{store.remark}</td>
                                    <td>
                                        <div className="flex gap-1 justify-center">
                                            <button className="table-edit-btn table-action-btn"
                                                onClick={() => openModalTransfer(store.name, store.id)}>
                                                <i className="fa fa-exchange-alt mr-2"></i>
                                                Transfer
                                            </button>
                                            <button onClick={() => openModalImport(store.id)}
                                                className="table-edit-btn table-action-btn">
                                                <i className="fa fa-plus mr-2"></i>
                                                Import
                                            </button>
                                            <button className="table-edit-btn table-action-btn"
                                                onClick={() => openModalHistory(store.id)}>
                                                <i className="fa fa-history mr-2"></i>
                                                Import History
                                            </button>
                                            <button onClick={() => handleEdit(store)}
                                                className="table-edit-btn table-action-btn">
                                                <i className="fa fa-pencil"></i>
                                            </button>
                                            <button onClick={() => handleDelete(store.id)}
                                                className="table-delete-btn table-action-btn">
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <Modal title='Add Inventory' onClose={() => setShowModal(false)}>
                        <form onSubmit={(e) => handleSave(e)}>
                            <div className="flex flex-col gap-2">
                                <div>
                                    <label>Inventory Name</label>
                                    <input type="text" className="input-field" value={name}
                                        onChange={(e) => setName(e.target.value)} />
                                </div>

                                <div>
                                    <label>Address</label>
                                    <input type="text" className="input-field" value={address}
                                        onChange={(e) => setAddress(e.target.value)} />
                                </div>

                                <div>
                                    <label>Remark</label>
                                    <input type="text" className="input-field" value={remark}
                                        onChange={(e) => setRemark(e.target.value)} />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowModal(false)}
                                        className="modal-btn modal-btn-cancel">
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <button type="submit" className="modal-btn modal-btn-submit">
                                        <i className="fas fa-check mr-2"></i>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </Modal>
                )}

                {showModalImport && (
                    <Modal title='Import to Inventory' onClose={closeModalImport}>
                        <form onSubmit={(e) => handleImport(e)}>
                            <div className="flex flex-col gap-2">
                                <div>
                                    <label>Product</label>
                                    <select className="input-field" value={productionId}
                                        onChange={(e) => changeProduction(Number(e.target.value))}>
                                        {productions.map((production) => (
                                            <option key={production.id} value={production.id}>
                                                {production.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>Total Produced</label>
                                    <input type="number" value={totalProductionLog} className="input-field" readOnly disabled />
                                </div>

                                <div>
                                    <label>Loss</label>
                                    <input type="number" value={totalProductionLoss} className="input-field" readOnly disabled />
                                </div>

                                <div>
                                    <label>Available</label>
                                    <input type="number" value={totalProductionFree} className="input-field" readOnly disabled />
                                </div>

                                <div>
                                    <label>Import Quantity</label>
                                    <input type="number" className="input-field"
                                        value={qtyImport}
                                        onChange={(e) => setQtyImport(e.target.value === '' ? '' : Number(e.target.value))} />
                                </div>

                                <div>
                                    <label>Remark</label>
                                    <input type="text" className="input-field" value={remarkImport}
                                        onChange={(e) => setRemarkImport(e.target.value)} />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button type="button" className="modal-btn modal-btn-cancel"
                                        onClick={closeModalImport}>
                                        <i className="fas fa-times mr-2"></i>
                                        Cancel
                                    </button>
                                    <button type="submit" className="modal-btn modal-btn-submit">
                                        <i className="fas fa-check mr-2"></i>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </Modal>
                )}

                {showModalHistory && (
                    <Modal title='Import History' onClose={closeModalHistory} size="2xl">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Remark</th>
                                        <th>Date</th>
                                        <th className="w-[60px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {storeImports.map((storeImport) => (
                                        <tr key={storeImport.id}>
                                            <td>{storeImport.production.name}</td>
                                            <td>{storeImport.qty}</td>
                                            <td>{storeImport.remark}</td>
                                            <td>{new Date(storeImport.importDate).toLocaleDateString()}</td>
                                            <td>
                                                <button onClick={() => handleDeleteImport(storeImport.id, storeImport.store.id)}
                                                    className="table-delete-btn table-action-btn">
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Modal>
                )}

                {showModalTransfer && (
                    <Modal title='Transfer Product' onClose={closeModalTransfer} size='xl'>
                        <form className="flex flex-col gap-2"
                            onSubmit={(e) => handleTransferStock(e)}>
                            <div>
                                <label>From</label>
                                <input disabled type="text" value={fromStoreName} />
                            </div>
                            <div>
                                <label>To</label>
                                {/* Controlled, with a placeholder: an uncontrolled select shows the
                                    first option while the state is still 0, so pressing Save sent
                                    a reference to a store that does not exist. The source
                                    warehouse is filtered out - transferring to itself is a no-op. */}
                                <select value={toStoreId} onChange={(e) => setToStoreId(Number(e.target.value))}>
                                    <option value={0}>-- Select a warehouse --</option>
                                    {stores.filter((store) => store.id !== fromStoreId).map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Product</label>
                                <select value={productionTransfer} onChange={(e) => setProductionTransfer(Number(e.target.value))}>
                                    <option value={0}>-- Select a product --</option>
                                    {productions.map((production) => (
                                        <option key={production.id} value={production.id}>
                                            {production.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Quantity</label>
                                <input type="number" value={qtyTransfer}
                                    onChange={(e) => setQtyTransfer(e.target.value === '' ? '' : Number(e.target.value))} />
                            </div>
                            <div>
                                <label>Remark</label>
                                <input type="text" value={remarkTransfer}
                                    onChange={(e) => setRemarkTransfer(e.target.value)} />
                            </div>
                            <div>
                                <label>Transfer Date</label>
                                {/* Controlled and capped at today, same as the production screens */}
                                <input type="date"
                                    max={new Date().toISOString().split('T')[0]}
                                    value={isNaN(transferCreatedAt.getTime()) ? '' : transferCreatedAt.toISOString().split('T')[0]}
                                    onChange={(e) => setTransferCreatedAt(e.target.value ? new Date(e.target.value) : new Date())} />
                            </div>
                            <div className="flex justify-end gap-2 mt-3">
                                <button type="button" className="modal-btn modal-btn-cancel"
                                    onClick={closeModalTransfer}>
                                    <i className="fas fa-times mr-2"></i>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-btn modal-btn-submit">
                                    <i className="fas fa-check mr-2"></i>
                                    Save
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {showModalHistoryTransfer && (
                    <Modal title='Transfer History' onClose={closeModalHistoryTransfer} size='3xl'>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Remark</th>
                                        <th>Date</th>
                                        <th className="w-[60px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transferStores.map((transferStore) => (
                                        <tr key={transferStore.id}>
                                            <td>{transferStore.fromStore.name}</td>
                                            <td>{transferStore.toStore.name}</td>
                                            <td>{transferStore.production.name}</td>
                                            <td>{transferStore.quantity}</td>
                                            <td>{transferStore.remark}</td>
                                            <td>{new Date(transferStore.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button onClick={() => handleDeleteTransfer(transferStore.id)}
                                                    className="table-delete-btn table-action-btn">
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    )
}