"use client"
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Upload, DollarSign, Package, FileText, Palette, MessageCircle, Code, Camera, Music, BookOpen } from 'lucide-react';
import { adddidigitalproduct } from '@/lib/actions/blog';

export default function DigitalProductsForm() {
    const [loading, setLoading] = useState(false);
   
    const [formData, setFormData] = useState({
        product_title: "",
        product_description: "",
        category: "",
        price: 0,
        discount_price: 0,
        product_type: "digital_download", // digital_download, service, consultation
        delivery_method: "instant_download", // instant_download, email, scheduled_call
        tags: "",
        preview_images: "",
        product_files: "", // For downloadable products
        consultation_duration: "", // For consultation services
        available_slots: "", // For services
        skill_level: "beginner", // beginner, intermediate, advanced
        software_requirements: "",
        file_formats: "",
        license_type: "personal", // personal, commercial, extended
        refund_policy: "no_refunds", // no_refunds, 7_days, 30_days
        status: "draft", // draft, active, inactive
        featured: false,
        user_id: "", // This would be populated from your auth system
    });

    const productCategories = [
        { value: "pdf_guides", label: "📄 PDF Guides & E-books", icon: FileText },
        { value: "hardware_projects", label: "⚡ Hardware Projects & Schematics", icon: Package },
        { value: "art_design", label: "🎨 Art & Design Assets", icon: Palette },
        { value: "consultations", label: "💬 1-on-1 Consultations", icon: MessageCircle },
        { value: "code_templates", label: "💻 Code Templates & Scripts", icon: Code },
        { value: "photography", label: "📸 Photography & Stock Images", icon: Camera },
        { value: "audio_music", label: "🎵 Audio & Music", icon: Music },
        { value: "courses_tutorials", label: "🎓 Online Courses & Tutorials", icon: BookOpen },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let fieldValue: string | number | boolean = value;
        if (type === 'checkbox' && 'checked' in e.target) {
            fieldValue = (e.target as HTMLInputElement).checked;
        }
        setFormData(prevState => ({
            ...prevState,
            [name]: fieldValue,
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        
        try {
            console.log('Digital Product Data:', formData);
            
            // Replace this with your actual Supabase insert

            const productResult = await adddidigitalproduct(formData);
            
      
            
            console.log('Product added successfully!');
            
            // Reset form
            setFormData({
                product_title: "",
                product_description: "",
                category: "",
                price: 0,
                discount_price: 0,
                product_type: "digital_download",
                delivery_method: "instant_download",
                tags: "",
                preview_images: "",
                product_files: "",
                consultation_duration: "",
                available_slots: "",
                skill_level: "beginner",
                software_requirements: "",
                file_formats: "",
                license_type: "personal",
                refund_policy: "no_refunds",
                status: "draft",
                featured: false,
                user_id: "",
            });
            
        } catch (error) {
            console.error('Error adding product:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Digital Product</h1>
                <p className="text-gray-600">Create your digital product listing to start selling online</p>
            </div>

            <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Package className="mr-2" size={24} />
                        Basic Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Title *
                            </label>
                            <input
                                type="text"
                                name="product_title"
                                value={formData.product_title}
                                onChange={handleChange}
                                placeholder="e.g., Complete Arduino Projects Bundle"
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Description *
                            </label>
                            <textarea
                                name="product_description"
                                value={formData.product_description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe what customers will get, key features, and benefits..."
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Category</option>
                                {productCategories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Type
                            </label>
                            <select
                                name="product_type"
                                value={formData.product_type}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="digital_download">Digital Download</option>
                                <option value="service">Service</option>
                                <option value="consultation">Consultation</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <DollarSign className="mr-2" size={24} />
                        Pricing
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Discount Price ($)
                            </label>
                            <input
                                type="number"
                                name="discount_price"
                                value={formData.discount_price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                License Type
                            </label>
                            <select
                                name="license_type"
                                value={formData.license_type}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="personal">Personal Use</option>
                                <option value="commercial">Commercial Use</option>
                                <option value="extended">Extended License</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <FileText className="mr-2" size={24} />
                        Product Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delivery Method
                            </label>
                            <select
                                name="delivery_method"
                                value={formData.delivery_method}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="instant_download">Instant Download</option>
                                <option value="email">Email Delivery</option>
                                <option value="scheduled_call">Scheduled Call</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skill Level
                            </label>
                            <select
                                name="skill_level"
                                value={formData.skill_level}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                File Formats (comma separated)
                            </label>
                            <input
                                type="text"
                                name="file_formats"
                                value={formData.file_formats}
                                onChange={handleChange}
                                placeholder="e.g., PDF, ZIP, PNG, SVG"
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Software Requirements
                            </label>
                            <input
                                type="text"
                                name="software_requirements"
                                value={formData.software_requirements}
                                onChange={handleChange}
                                placeholder="e.g., Arduino IDE, Photoshop, etc."
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {formData.product_type === 'consultation' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Consultation Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="consultation_duration"
                                        value={formData.consultation_duration}
                                        onChange={handleChange}
                                        min="15"
                                        step="15"
                                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Available Time Slots
                                    </label>
                                    <input
                                        type="text"
                                        name="available_slots"
                                        value={formData.available_slots}
                                        onChange={handleChange}
                                        placeholder="e.g., Mon-Fri 9AM-5PM EST"
                                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g., arduino, electronics, beginner, diy"
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Files & Media */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Upload className="mr-2" size={24} />
                        Files & Media
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preview Images (URLs, comma separated)
                            </label>
                            <textarea
                                name="preview_images"
                                value={formData.preview_images}
                                onChange={handleChange}
                                rows={3}
                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Files (URLs, comma separated)
                            </label>
                            <textarea
                                name="product_files"
                                value={formData.product_files}
                                onChange={handleChange}
                                rows={3}
                                placeholder="https://example.com/file1.zip, https://example.com/file2.pdf"
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Refund Policy
                            </label>
                            <select
                                name="refund_policy"
                                value={formData.refund_policy}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="no_refunds">No Refunds</option>
                                <option value="7_days">7 Days</option>
                                <option value="30_days">30 Days</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">Featured Product</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({...formData, status: 'draft'});
                            handleSubmit();
                        }}
                        className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? 'Adding Product...' : 'Add Product'}
                        <Package className="ml-2" size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}