'use client'

// Import required libraries
import { useState, useEffect, useCallback } from "react"
import Swal from "sweetalert2" // สำหรับ popup แจ้งเตือน / For alert popups
import { Config } from "@/Config" // ไฟล์คอนฟิกสำหรับ API URL และ Token Key
import Modal from "../components/Modal" // คอมโพเนนต์ Modal สำหรับแสดงกล่อง popup
import axios from "axios" // ไลบรารีสำหรับทำ HTTP requests
import { UserInterface } from "@/interface/UserInterface"

export default function Page() {
    // State สำหรับเก็บข้อมูลต่างๆ / States for storing data
    const [users, setUsers] = useState<UserInterface[]>([]); // All users
    const [showModal, setShowModal] = useState(false); // Show/hide modal
    const [editingUser, setEditingUser] = useState<UserInterface | null>(null); // ผู้ใช้ที่กำลังแก้ไข / User being edited
    const [email, setEmail] = useState(''); //Email in form
    const [username, setUsername] = useState(''); // Username in form
    const [password, setPassword] = useState(''); // Password in form
    const [passwordConfirm, setPasswordConfirm] = useState(''); // Confirm password in form
    const [role, setRole] = useState('employee'); // User role (employee/admin)

    // Fetch users from API
    const fetchUsers = useCallback(async () => {
        try {
            const token = localStorage.getItem(Config.tokenKey);
            if (!token) {
                Swal.fire({
                    title: 'Authentication Required',
                    icon: 'warning',
                    text: 'Please log in to view users'
                });
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const response = await axios.get(`${Config.apiUrl}/users`, { headers }); //  Call API to fetch users
            // If successful (status 200), store users data

            if (response.status === 200) {
                setUsers(response.data);
            }
            // If not successful, show error message
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: (error as Error).message,
                icon: 'error'
            })
        }
    }, []);

    // Load users when page opens
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle form submit (add/edit user)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ตรวจสอบ password และ confirm password (ถ้ามี)
        if (password !== passwordConfirm) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password and Confirm Password do not match'
            });
            return;
        }

        try {
            const url = editingUser
                ? `${Config.apiUrl}/users/admin-update-profile/${editingUser.id}`
                : `${Config.apiUrl}/users/admin-create`


            const payload = {
                id: editingUser?.id || null,
                email: email,
                username: username,
                password: password || '',
                role: role
            };

            const headers = {
                'Authorization': 'Bearer ' + localStorage.getItem(Config.tokenKey)
            };

            const response = editingUser
                ? await axios.put(url, payload, { headers })
                : await axios.post(url, payload, { headers });

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `User ${editingUser ? 'updated' : 'created'} successfully`,
                    timer: 1000
                });

                setShowModal(false);
                setEditingUser(null);
                setEmail('');
                setUsername('');
                setPassword('');
                setPasswordConfirm('');
                fetchUsers();
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: (error as Error).message,
                icon: 'error'
            });
        }
    }

    // Handle user deletion
    const handleDelete = async (user: UserInterface) => {
        try {
            //  Show confirmation popup before deleting
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Are you sure?',
                text: `Do you want to delete user ${user.username}?`,
                showCancelButton: true,
                showConfirmButton: true
            })
            // If confirmed deletion
            if (result.isConfirmed) {
                const headers = {
                    'Authorization': 'Bearer ' + localStorage.getItem(Config.tokenKey)  // Use API Key from localStorage
                }
                const url = `${Config.apiUrl}/users/admin-delete/${user.id}`; // URL for deleting user
                // Send delete request to API
                const response = await axios.delete(url, { headers })

                if (response.status === 200 || response.status === 204) { // 204 No Content for successful deletion
                    Swal.fire({
                        icon: 'success',
                        title: 'success',
                        text: 'User deleted successfully',
                        timer: 1000
                    })

                    //  Refresh data
                    fetchUsers();
                }
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: (error as Error).message,
                icon: 'error'
            });
        }
    }

    // Handle user editing
    const handleEdit = (user: UserInterface) => {
        // Prepare data for editing
        setEditingUser(user);
        // email is nullable in the database; null would make these inputs uncontrolled
        setEmail(user.email ?? '');
        setUsername(user.username ?? '');
        setPassword('');
        setShowModal(true); // Show modal for editing
        setRole(user.role ?? 'employee');

    }

    // ส่วนแสดงผล UI / UI rendering
    return (
        <div className="container mx-auto p-4">
            {/*  Page title */}
            <h1 className="text-2xl font-bold mb-5">User Management</h1>

            {/* Add user button */}
            <div className="flex justify-between items-center mb-6">
                <button className="button-add"
                    onClick={() => {
                        setEditingUser(null)
                        setEmail('')
                        setUsername('')
                        setPassword('')
                        setPasswordConfirm('')
                        setRole('employee')
                        setShowModal(true)
                    }}
                >
                    <i className="fas fa-plus mr-2"></i>
                    Add User
                </button>
            </div>

            {/* User list table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th className="w-[120px]">Username</th>
                            <th>Role</th>
                            <th className="text-right" style={{ width: '100px' }}>&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/*  Display user list */}
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                                <td className="text-right">
                                    {/*  Edit button */}
                                    <button className="table-action-btn table-edit-btn mr-2"
                                        onClick={() => handleEdit(user)}
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    {/* Delete button */}
                                    <button className="table-action-btn table-delete-btn"
                                        onClick={() => handleDelete(user)}
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Show modal for adding/editing user */}
            {showModal && (

                <Modal id="user-modal" title="User Information" onClose={() => setShowModal(false)} size="md">
                    <form onSubmit={handleSubmit}>
                        {/*  Email form */}
                        <div className="mb-4">
                            <label className="block mb-2">Email</label>
                            <input type="email" className="form-input" value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        {/*  Username form */}
                        <div className="mb-4">
                            <label className="block mb-2">Username</label>
                            <input type="text" className="form-input" value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        {/* Password form */}
                        <div className="mb-4">
                            <label className="block mb-2">Password</label>
                            <input type="password" className="form-input"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required={!editingUser}
                            />
                        </div>
                        {/*  Confirm Password form */}
                        <div className="mb-4">
                            <label className="block mb-2">Confirm Password</label>
                            <input type="password" className="form-input"
                                value={passwordConfirm}
                                onChange={e => setPasswordConfirm(e.target.value)}
                                required={!editingUser || password !== ''}
                            />
                        </div>
                        {/* Role */}
                        <div className="mb-4">
                            <label className="block mb-2">Role</label>
                            <select className="form-input" value={role}
                                onChange={e => setRole(e.target.value)}
                            >
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        {/*  Action buttons */}
                        <div className="flex justify-end gap-2 ">
                            <button type="button" onClick={() => setShowModal(false)}
                                className="modal-btn modal-btn-cancel">
                                <i className="fas fa-times mr-2 "></i>
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
        </div>
    )
}










