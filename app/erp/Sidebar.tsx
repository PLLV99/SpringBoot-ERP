
'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Config } from '../Config';
import Link from 'next/link';

export default function Sidebar() {
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem(Config.tokenKey);
            const response = await axios.get(`${Config.apiUrl}/api/users/admin-info`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                setUsername(response.data.username);
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch user data : ' + err
            })
        }
    }

    const handleLogout = async () => {
        try {
            const button = await Swal.fire({
                icon: 'question',
                title: 'Are you sure?',
                text: 'Do you want to logout?',
                showCancelButton: true,
                showConfirmButton: true
            })

            if (button.isConfirmed) {
                localStorage.removeItem(Config.tokenKey);
                router.push('/');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to logout : ' + err
            })
        }
    }
    return (
        <>
            <div className='sidebar'>
                <div className='sidebar-container'>
                    <div className='sidebar-title'>
                        <h1>
                            <i className='fas fa-leaf mr-3'></i>
                            Spring ERP
                        </h1>
                        <div className='text-lg font-normal mt-3 mb-4'>
                            <i className='fas fa-user mr-3'></i>
                            {username}
                        </div>
                        <div className='flex gap-2 m-3 justify-center'>
                            <Link href='/erp/user/edit' className='btn-edit'>
                                <i className='fas fa-edit mr-2'></i>
                                Edit
                            </Link>
                            <button className='btn-logout' onClick={handleLogout}>
                                <i className='fas fa-sign-out-alt mr-2'></i>
                                Logout
                            </button>
                        </div>
                    </div>
                    <nav>
                        <ul className='sidenbar-nav-list'>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/dashboard" className='sidebar-nav-link'>
                                    <i className='fas fa-home mr-2'></i>
                                    <span>Dashboard</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/stock" className='sidebar-nav-link'>
                                    <i className='fas fa-box-open mr-2'></i>
                                    <span>Inventory</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/production" className='sidebar-nav-link' >
                                    <i className='fas fa-cogs mr-2'></i>
                                    <span>Production</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/sale" className='sidebar-nav-link' >
                                    <i className='fas fa-money-bill-trend-up mr-2'></i>
                                    <span>Sales</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/account" className='sidebar-nav-link' >
                                    <i className='fas fa-file-invoice-dollar mr-2'></i>
                                    <span>Accounting</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/customer" className='sidebar-nav-link' >
                                    <i className='fas fa-handshake mr-2'></i>
                                    <span>Customers</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/procurement" className='sidebar-nav-link'>
                                    <i className='fas fa-shopping-cart mr-2'></i>
                                    <span>Procurement</span>
                                </Link>
                            </li>

                            <li className='sidebar-nav-item'>
                                <Link href="/erp/hr" className='sidebar-nav-link'>
                                    <i className='fas fa-users-cog mr-2'></i>
                                    <span>Human Resources</span>
                                </Link>
                            </li>

                            <li className='sidebar-nav-item'>
                                <Link href="/erp/report" className='sidebar-nav-link' >
                                    <i className='fas fa-chart-line mr-2'></i>
                                    <span>Reports</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/user" className='sidebar-nav-link' >
                                    <i className='fas fa-user-alt mr-2'></i>
                                    <span>Users</span>
                                </Link>
                            </li>
                            <li className='sidebar-nav-item'>
                                <Link href="/erp/settings" className='sidebar-nav-link'>
                                    <i className='fas fa-cogs mr-2'></i>
                                    <span>Settings</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div >
            </div >
        </>
    )
}