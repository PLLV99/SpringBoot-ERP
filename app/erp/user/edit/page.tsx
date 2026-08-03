'use client'
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Config } from '@/Config';


export default function EditProfile() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();

    const fecthUserData = useCallback(async () => {
        try {
            const token = localStorage.getItem(Config.tokenKey);
            const response = await axios.get(`${Config.apiUrl}/users/admin-info`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                // Fall back to '': email is nullable in the database, and a null
                // value turns these controlled inputs into uncontrolled ones
                setUsername(response.data.username ?? '');
                setEmail(response.data.email ?? '');
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch user data : ' + (error as Error).message
            });

        }
    }, []);

    useEffect(() => {
        fecthUserData();
    }, [fecthUserData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (password !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Password and Confirm Password do not match'
                });
                return;
            }

            const token = localStorage.getItem(Config.tokenKey);
            const url = `${Config.apiUrl}/users/edit-profile`;
            const payload = {
                username,
                email,
                password
            }
            const headers = {
                'Authorization': `Bearer ${token}`
            }
            const response = await axios.put(url, payload, { headers });
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile updated successfully'
                });
                router.push('/erp/dashboard');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update profile : ' + (error as Error).message
            });

        }
    }

    return (
        <div>
            <h1 className="login-title">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className='from-group flex items-center'>
                    <button type="submit" className="button-add w-full">
                        <i className="fas fa-save mr-2"></i>
                        Update Profile
                    </button>
                </div>
            </form>
        </div>
    )
}