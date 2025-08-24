'use client';

import { useState, useEffect } from 'react';
import { logsAPI } from '@/lib/api';
import { Log, LogStats, PaginatedLogsResponse } from '@/types';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [stats, setStats] = useState<LogStats | null>(null);
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(20);
    const [showModal, setShowModal] = useState(false);
    //denme
    // Filters
    const [levelFilter, setLevelFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const logLevels = [
        { key: '', label: 'Tüm Seviyeler' },
        { key: 'Information', label: 'Bilgi' },
        { key: 'Warning', label: 'Uyarı' },
        { key: 'Error', label: 'Hata' },
        { key: 'Critical', label: 'Kritik' }
    ];

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Information':
                return 'primary';
            case 'Warning':
                return 'warning';
            case 'Error':
                return 'danger';
            case 'Critical':
                return 'danger';
            default:
                return 'default';
        }
    };

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const params = {
                level: levelFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                pageNumber: currentPage,
                pageSize
            };

            const response = await logsAPI.getAll(params);
            if (response.success) {
                const data = response.data as PaginatedLogsResponse;
                setLogs(data.data);
                setTotalPages(data.totalPages);
            } else {
                console.error('Loglar yüklenirken hata oluştu');
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await logsAPI.getStats();
            if (response.success) {
                setStats(response.data as LogStats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleClearOldLogs = async () => {
        try {
            const response = await logsAPI.clearOldLogs(30);
            if (response.success) {
                console.log('Eski loglar temizlendi');
                fetchLogs();
                fetchStats();
            } else {
                console.error('Loglar temizlenirken hata oluştu');
            }
        } catch (error) {
            console.error('Error clearing logs:', error);
        }
    };

    const handleLogClick = async (log: Log) => {
        try {
            const response = await logsAPI.getById(log.id);
            if (response.success) {
                setSelectedLog(response.data as Log);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching log details:', error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR');
    };

    const parseProperties = (propertiesString?: string) => {
        if (!propertiesString) return null;
        try {
            return JSON.parse(propertiesString);
        } catch {
            return null;
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [currentPage, levelFilter, startDate, endDate]);

    const resetFilters = () => {
        setLevelFilter('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Sistem Logları</h1>
                <Button
                    color="warning"
                    variant="flat"
                    onPress={handleClearOldLogs}
                >
                    Eski Logları Temizle (30+ gün)
                </Button>
            </div>

            {/* İstatistikler */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardBody className="text-center">
                            <p className="text-2xl font-bold">{stats.totalLogs}</p>
                            <p className="text-small text-gray-500">Toplam Log</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="text-center">
                            <p className="text-2xl font-bold text-danger">{stats.errorLogs}</p>
                            <p className="text-small text-gray-500">Hata Logu</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="text-center">
                            <p className="text-2xl font-bold">{stats.todayLogs}</p>
                            <p className="text-small text-gray-500">Bugün</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="text-center">
                            <p className="text-2xl font-bold">{stats.thisWeekLogs}</p>
                            <p className="text-small text-gray-500">Bu Hafta</p>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="text-center">
                            <p className="text-2xl font-bold">{stats.thisMonthLogs}</p>
                            <p className="text-small text-gray-500">Bu Ay</p>
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Filtreler */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Filtreler</h2>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            label="Log Seviyesi"
                            placeholder="Seviye seçin"
                            selectedKeys={levelFilter ? [levelFilter] : []}
                            onSelectionChange={(keys: any) => setLevelFilter(Array.from(keys)[0] as string || '')}
                        >
                            {logLevels.map((level) => (
                                <SelectItem key={level.key}>
                                    {level.label}
                                </SelectItem>
                            ))}
                        </Select>

                        <Input
                            label="Başlangıç Tarihi"
                            type="datetime-local"
                            value={startDate}
                            onChange={(e: any) => setStartDate(e.target.value)}
                        />

                        <Input
                            label="Bitiş Tarihi"
                            type="datetime-local"
                            value={endDate}
                            onChange={(e: any) => setEndDate(e.target.value)}
                        />

                        <Button
                            color="secondary"
                            variant="flat"
                            onPress={resetFilters}
                        >
                            Filtreleri Temizle
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Loglar Tablosu */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Loglar</h2>
                </CardHeader>
                <CardBody>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tarih
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Seviye
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mesaj
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Aksiyon
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {logs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(log.timestamp)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Chip
                                                        color={getLevelColor(log.level) as any}
                                                        size="sm"
                                                        variant="flat"
                                                    >
                                                        {log.level}
                                                    </Chip>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                                                    {log.message}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Button
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() => handleLogClick(log)}
                                                    >
                                                        Detay
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center mt-4 space-x-2">
                                    <Button
                                        size="sm"
                                        variant="flat"
                                        isDisabled={currentPage === 1}
                                        onPress={() => setCurrentPage(currentPage - 1)}
                                    >
                                        Önceki
                                    </Button>

                                    <span className="text-sm text-gray-700">
                                        Sayfa {currentPage} / {totalPages}
                                    </span>

                                    <Button
                                        size="sm"
                                        variant="flat"
                                        isDisabled={currentPage === totalPages}
                                        onPress={() => setCurrentPage(currentPage + 1)}
                                    >
                                        Sonraki
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Log Detay Modal */}
            {showModal && selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Log Detayı</h3>
                            <Button
                                size="sm"
                                variant="flat"
                                onPress={() => setShowModal(false)}
                            >
                                Kapat
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold">ID:</p>
                                <p>{selectedLog.id}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Tarih:</p>
                                <p>{formatDate(selectedLog.timestamp)}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Seviye:</p>
                                <Chip
                                    color={getLevelColor(selectedLog.level) as any}
                                    size="sm"
                                    variant="flat"
                                >
                                    {selectedLog.level}
                                </Chip>
                            </div>
                            <div>
                                <p className="font-semibold">Mesaj:</p>
                                <p className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
                                    {selectedLog.message}
                                </p>
                            </div>
                            {selectedLog.exception && (
                                <div>
                                    <p className="font-semibold">Hata Detayı:</p>
                                    <pre className="bg-red-50 p-3 rounded text-sm overflow-auto max-h-40">
                                        {selectedLog.exception}
                                    </pre>
                                </div>
                            )}
                            {selectedLog.properties && (
                                <div>
                                    <p className="font-semibold">Özellikler:</p>
                                    <pre className="bg-blue-50 p-3 rounded text-sm overflow-auto">
                                        {JSON.stringify(parseProperties(selectedLog.properties), null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
