import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { io } from 'socket.io-client'

// Leaflet (lazy-loaded to avoid SSR issues)
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons for bundled environments
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const deliveryIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
})

// Auto-fit map to markers
const FitBounds = ({ positions }) => {
    const map = useMap()
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions)
            map.fitBounds(bounds, { padding: [40, 40] })
        }
    }, [positions])
    return null
}

const DeliveryDashboard = ({ token }) => {
    const [deliveryPersons, setDeliveryPersons] = useState([])
    const socketRef = useRef(null)

    const fetchTracking = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/delivery/tracking', { headers: { token } })
            if (res.data.success) setDeliveryPersons(res.data.deliveryPersons)
        } catch (err) {
            toast.error(err.message)
        }
    }

    useEffect(() => {
        fetchTracking()

        // Connect socket and subscribe to admin room
        socketRef.current = io(backendUrl, { transports: ['websocket', 'polling'] })
        socketRef.current.emit('admin:join')

        socketRef.current.on('delivery-location-update', ({ deliveryPersonId, name, lat, lng }) => {
            setDeliveryPersons(prev =>
                prev.map(dp =>
                    dp._id === deliveryPersonId
                        ? { ...dp, currentLocation: { lat, lng, updatedAt: new Date() } }
                        : dp
                )
            )
        })

        socketRef.current.on('order-status-update', () => {
            // Optionally refresh
        })

        return () => socketRef.current?.disconnect()
    }, [token])

    const activeWithLocation = deliveryPersons.filter(dp =>
        dp.isActive && dp.currentLocation?.lat != null
    )

    const positions = activeWithLocation.map(dp => [dp.currentLocation.lat, dp.currentLocation.lng])

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Live Delivery Tracking</h2>
                <button
                    onClick={fetchTracking}
                    className="text-sm border border-gray-300 px-4 py-1.5 rounded hover:bg-gray-50"
                >
                    Refresh
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-white border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{deliveryPersons.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Delivery Persons</p>
                </div>
                <div className="bg-white border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {deliveryPersons.filter(dp => dp.isActive && !dp.isAvailable).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">On Delivery</p>
                </div>
                <div className="bg-white border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{activeWithLocation.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Sharing Live Location</p>
                </div>
            </div>

            {/* Map */}
            <div className="border rounded-lg overflow-hidden mb-6" style={{ height: '420px' }}>
                <MapContainer
                    center={positions.length > 0 ? positions[0] : [20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {activeWithLocation.map(dp => (
                        <Marker
                            key={dp._id}
                            position={[dp.currentLocation.lat, dp.currentLocation.lng]}
                            icon={deliveryIcon}
                        >
                            <Popup>
                                <div>
                                    <p className="font-bold">{dp.name}</p>
                                    <p className="text-xs text-gray-500">{dp.phone}</p>
                                    <p className="text-xs mt-1">Orders: {dp.assignedOrders?.length || 0}</p>
                                    <p className="text-xs text-gray-400">
                                        Updated: {dp.currentLocation.updatedAt
                                            ? new Date(dp.currentLocation.updatedAt).toLocaleTimeString()
                                            : 'unknown'}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    {positions.length > 0 && <FitBounds positions={positions} />}
                </MapContainer>
            </div>

            {/* Delivery person list */}
            <h3 className="text-base font-semibold text-gray-700 mb-3">Active Delivery Persons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {deliveryPersons.filter(dp => dp.isActive).map(dp => (
                    <div key={dp._id} className="bg-white border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-medium text-gray-800">{dp.name}</p>
                                <p className="text-xs text-gray-500">{dp.phone}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dp.isAvailable ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {dp.isAvailable ? 'Free' : 'On Delivery'}
                            </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                            <p>Orders assigned: <strong>{dp.assignedOrders?.length || 0}</strong></p>
                            {dp.currentLocation?.lat != null
                                ? <p className="text-green-600">
                                    Location sharing active &bull; {new Date(dp.currentLocation.updatedAt).toLocaleTimeString()}
                                  </p>
                                : <p className="text-gray-400">No location shared yet</p>
                            }
                        </div>
                    </div>
                ))}
                {deliveryPersons.filter(dp => dp.isActive).length === 0 && (
                    <p className="text-gray-400 text-sm col-span-3">No active delivery persons</p>
                )}
            </div>
        </div>
    )
}

export default DeliveryDashboard
