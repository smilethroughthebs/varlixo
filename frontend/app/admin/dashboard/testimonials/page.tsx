'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import toast from 'react-hot-toast';
import AdminLayout from '@/app/components/admin/AdminLayout';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  location: string;
  image: string;
  content: string;
  profit: string;
  active: boolean;
  createdAt: string;
}

export default function TestimonialsAdmin() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    image: '👨‍💼',
    content: '',
    profit: '',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/testimonials?limit=100');
      setTestimonials(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedTestimonial(null);
    setFormData({
      name: '',
      role: '',
      location: '',
      image: '👨‍💼',
      content: '',
      profit: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      location: testimonial.location,
      image: testimonial.image,
      content: testimonial.content,
      profit: testimonial.profit,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.delete(`/api/v1/testimonials/${id}`);
      setTestimonials(testimonials.filter((t) => t._id !== id));
      toast.success('Testimonial deleted successfully');
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedTestimonial) {
        await api.put(`/api/v1/testimonials/${selectedTestimonial._id}`, formData);
        setTestimonials(
          testimonials.map((t) =>
            t._id === selectedTestimonial._id ? { ...t, ...formData } : t
          )
        );
        toast.success('Testimonial updated successfully');
      } else {
        const response = await api.post('/api/v1/testimonials', formData);
        setTestimonials([response.data, ...testimonials]);
        toast.success('Testimonial created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to save testimonial');
    }
  };

  const filteredTestimonials = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emojis = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Testimonials Management</h1>
            <p className="text-gray-400 mt-2">Manage customer testimonials displayed on the homepage</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition"
          >
            <Plus size={20} />
            Add Testimonial
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search by name, role, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-dark-700 rounded-lg p-4"
          >
            <p className="text-gray-400 text-sm">Total Testimonials</p>
            <p className="text-3xl font-bold text-white mt-2">{testimonials.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-800 border border-dark-700 rounded-lg p-4"
          >
            <p className="text-gray-400 text-sm">Active</p>
            <p className="text-3xl font-bold text-primary-400 mt-2">
              {testimonials.filter((t) => t.active).length}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-800 border border-dark-700 rounded-lg p-4"
          >
            <p className="text-gray-400 text-sm">Countries</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">
              {new Set(testimonials.map((t) => t.location)).size}
            </p>
          </motion.div>
        </div>

        {/* Testimonials List */}
        <div className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading testimonials...</div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No testimonials found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-900 border-b border-dark-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name & Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Profit</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Content</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTestimonials.map((testimonial) => (
                    <tr key={testimonial._id} className="border-b border-dark-700 hover:bg-dark-900/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{testimonial.image}</span>
                          <div>
                            <p className="text-white font-medium">{testimonial.name}</p>
                            <p className="text-gray-400 text-sm">{testimonial.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{testimonial.location}</td>
                      <td className="px-6 py-4 text-primary-400 font-semibold">{testimonial.profit}</td>
                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{testimonial.content}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            testimonial.active
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {testimonial.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="p-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial._id)}
                          className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 border border-dark-700 rounded-lg p-8 max-w-2xl w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-2">Emoji Avatar</label>
                  <select
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    {emojis.map((emoji) => (
                      <option key={emoji} value={emoji}>
                        {emoji}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Testimonial Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">Profit Amount</label>
                <input
                  type="text"
                  value={formData.profit}
                  onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                  placeholder="e.g., +$42,800"
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
                >
                  {selectedTestimonial ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
