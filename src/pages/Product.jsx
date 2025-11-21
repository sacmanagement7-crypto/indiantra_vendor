import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Trash2, Edit, Package } from 'lucide-react';
import {
    getProductService,
    createProductService,
    deleteProductService,
    getCategoriesservice,
    UpdateProductService
} from '../services/api.service'

const Product = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [specifications, setSpecifications] = useState([{ label: '', value: '' }]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        oldPrice: '',
        discount: '',
        category: '',
        images: [],
        isFeatured: false,
        isBestDeal: false,
        isRecommended: false,
        inStock: true,
        shortdescription: '',
        longdescription: ''
    });

    const fetchCategories = async () => {
        try {
            const res = await getCategoriesservice();
            const cat = res?.data?.categories ?? [];
            setCategories(cat);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProductService();
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = (e) => {
        const newFiles = Array.from(e.target.files);

        setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...newFiles], // ✅ append to old ones
        }));

        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...(prev || []), ...newPreviews]); // ✅ append previews
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpecificationChange = (index, field, value) => {
        const updated = [...specifications];
        updated[index][field] = value;
        setSpecifications(updated);
    };

    const addSpecification = () => {
        setSpecifications([...specifications, { label: '', value: '' }]);
    };

    const removeSpecification = (index) => {
        setSpecifications(specifications.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                if (key !== "images") {
                    data.append(key, formData[key]);
                }
            });

            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((file) => {
                    data.append("images", file);
                });
            }

            // Add specifications as JSON string
            const validSpecs = specifications.filter(spec => spec.label && spec.value);
            data.append("specifications", JSON.stringify(validSpecs));

            let response;
            if (editMode) {
                response = await UpdateProductService(editingId, data);
                setProducts(prev => prev.map(p => p._id === editingId ? response.data : p));
            } else {
                response = await createProductService(data);
                setProducts(prev => [...prev, response.data]);
            }

            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleEdit = (product) => {
        setEditMode(true);
        setEditingId(product._id);
        setFormData({
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice || '',
            discount: product.discount || '',
            category: product.category,
            images: [],
            isFeatured: false,
            isBestDeal: false,
            isRecommended: false,
            inStock: product.inStock ?? true,
            shortdescription: product.shortdescription || '',
            longdescription: product.longdescription || ''
        });

        // Set specifications
        if (product.specifications && product.specifications.length > 0) {
            setSpecifications(product.specifications);
        } else {
            setSpecifications([{ label: '', value: '' }]);
        }

        // Show existing images as previews
        if (product.images && product.images.length > 0) {
            const existingPreviews = product.images.map(img =>
                `${img}`
            );
            setImagePreviews(existingPreviews);
        }

        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            oldPrice: '',
            discount: '',
            category: '',
            images: [],
            isFeatured: false,
            isBestDeal: false,
            isRecommended: false,
            inStock: true,
            shortdescription: '',
            longdescription: ''
        });
        setImagePreviews([]);
        setSpecifications([{ label: '', value: '' }]);
        setEditMode(false);
        setEditingId(null);
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await deleteProductService(id);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
                            <Package className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                                Products
                            </h1>
                            <p className="text-sm text-gray-600">Manage your product inventory</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        Add Product
                    </button>
                </div>

                {/* Products Grid */}
                {loading && products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border-2 border-orange-100">
                            <Package className="mx-auto mb-4 text-orange-400" size={64} />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products yet</h3>
                            <p className="text-gray-600 mb-6">Get started by adding your first product!</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition"
                            >
                                Add Your First Product
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products?.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    {product.images && product.images[0] ? (
                                        <img
                                            src={`${product.images[0]}`}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-orange-50">
                                            <Package className="text-orange-300" size={64} />
                                        </div>
                                    )}

                                    {product.discount && (
                                        <span className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                                            {product.discount}
                                        </span>
                                    )}
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-lg mb-1 truncate text-gray-800">{product.name}</h3>
                                    <p className="text-sm text-orange-600 font-medium mb-3">{product.category}</p>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                                            ₹{product.price}
                                        </span>
                                        {product.oldPrice && (
                                            <span className="text-sm text-gray-400 line-through">₹{product.oldPrice}</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {product.isFeatured && (
                                            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                                                ⭐ Featured
                                            </span>
                                        )}
                                        {product.isBestDeal && (
                                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                                🔥 Best Deal
                                            </span>
                                        )}
                                        {product.isRecommended && (
                                            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                                                👍 Recommended
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2 font-medium shadow-md"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product._id)}
                                            className="bg-gradient-to-r from-red-50 to-red-100 text-red-600 px-4 py-2.5 rounded-lg hover:from-red-100 hover:to-red-200 transition shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Product Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-orange-100">
                            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {editMode ? 'Edit Product' : 'Add New Product'}
                                    </h2>
                                    <p className="text-orange-100 text-sm">
                                        {editMode ? 'Update product details' : 'Fill in the product details'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            placeholder="Enter product name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Short Description
                                        </label>
                                        <input
                                            type="text"
                                            name="shortdescription"
                                            value={formData.shortdescription}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            placeholder="Brief description"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Long Description
                                        </label>
                                        <textarea
                                            name="longdescription"
                                            value={formData.longdescription}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition resize-none"
                                            placeholder="Detailed description"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Price *
                                            </label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                required
                                                step="0.01"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Old Price
                                            </label>
                                            <input
                                                type="number"
                                                name="oldPrice"
                                                value={formData.oldPrice}
                                                onChange={handleInputChange}
                                                step="0.01"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-white"
                                            >
                                                <option value="">-- Select Category --</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat.name}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Discount
                                            </label>
                                            <input
                                                type="text"
                                                name="discount"
                                                value={formData.discount}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 17% OFF"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Specifications Section */}
                                    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Specifications
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addSpecification}
                                                className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                <Plus size={16} /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {specifications.map((spec, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={spec.label}
                                                        onChange={(e) => handleSpecificationChange(idx, 'label', e.target.value)}
                                                        placeholder="Label"
                                                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={spec.value}
                                                        onChange={(e) => handleSpecificationChange(idx, 'value', e.target.value)}
                                                        placeholder="Value"
                                                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-sm"
                                                    />
                                                    {specifications.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSpecification(idx)}
                                                            className="text-red-600 hover:text-red-700 p-2"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Product Images {editMode && '(Upload new to replace)'}
                                        </label>
                                        <div className="border-2 border-dashed border-orange-300 rounded-xl p-6 bg-orange-50 hover:bg-orange-100 transition">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="flex flex-col items-center cursor-pointer"
                                            >
                                                <Upload className="text-orange-500 mb-2" size={36} />
                                                <span className="text-sm font-medium text-orange-700">Click to upload images</span>
                                                <span className="text-xs text-orange-600 mt-1">PNG, JPG up to 10MB</span>
                                            </label>
                                        </div>
                                        {imagePreviews.length > 0 && (
                                            <div className="grid grid-cols-4 gap-3 mt-3">
                                                {imagePreviews.map((preview, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <img src={preview} alt="" className="w-full h-24 object-cover rounded-lg border-2 border-orange-200" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-200">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Product Badges</p>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="inStock"
                                                checked={formData.inStock}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-sm text-gray-700 font-medium">In Stock</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 font-medium shadow-lg"
                                    >
                                        {loading ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Product' : 'Add Product')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Product;