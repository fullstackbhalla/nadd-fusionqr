import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewBrandImage, setPreviewBrandImage] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageError, setImageError] = useState({});
    
    const [formData, setFormData] = useState({
        productName: '',
        categoryId: '',
        subcategoryId: '',
        price: '',
        color: '',
        brand: '',
        description: '',
        about: '',
        brandImage: null,
        productImage: null
    });

    // Color mapping - hex to color name
    const getColorName = (hexCode) => {
        const colorMap = {
            '#FF0000': 'Red',
            '#00FF00': 'Green',
            '#0000FF': 'Blue',
            '#FFFF00': 'Yellow',
            '#FF00FF': 'Magenta',
            '#00FFFF': 'Cyan',
            '#000000': 'Black',
            '#FFFFFF': 'White',
            '#FF6B9D': 'Pink',
            '#4CAF50': 'Green',
            '#FF9800': 'Orange',
            '#9C27B0': 'Purple',
            '#2196F3': 'Blue',
            '#795548': 'Brown',
            '#607D8B': 'Gray',
            '#FFC0CB': 'Light Pink',
            '#800000': 'Maroon',
            '#808000': 'Olive',
            '#008080': 'Teal',
            '#800080': 'Purple'
        };
        return colorMap[hexCode?.toUpperCase()] || hexCode || 'Not specified';
    };

    // Color options with names
    const colorOptions = [
        { hex: '#FF0000', name: 'Red' },
        { hex: '#00FF00', name: 'Green' },
        { hex: '#0000FF', name: 'Blue' },
        { hex: '#FFFF00', name: 'Yellow' },
        { hex: '#FF00FF', name: 'Magenta' },
        { hex: '#00FFFF', name: 'Cyan' },
        { hex: '#000000', name: 'Black' },
        { hex: '#FFFFFF', name: 'White' },
        { hex: '#FF6B9D', name: 'Pink' },
        { hex: '#4CAF50', name: 'Green' },
        { hex: '#FF9800', name: 'Orange' },
        { hex: '#9C27B0', name: 'Purple' },
        { hex: '#2196F3', name: 'Blue' },
        { hex: '#795548', name: 'Brown' },
        { hex: '#607D8B', name: 'Gray' },
        { hex: '#FFC0CB', name: 'Light Pink' },
        { hex: '#800000', name: 'Maroon' },
        { hex: '#808000', name: 'Olive' },
        { hex: '#008080', name: 'Teal' }
    ];

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        if (formData.categoryId) {
            fetchSubcategories(formData.categoryId);
        }
    }, [formData.categoryId]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/categories');
            console.log('Categories response:', response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            const response = await axios.get(`http://localhost:8081/api/subcategories/category/${categoryId}`);
            console.log('Subcategories response:', response.data);
            setSubcategories(response.data);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/api/products');
            console.log('Products response:', response.data);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setFormData({ ...formData, categoryId, subcategoryId: '' });
        if (categoryId) {
            fetchSubcategories(categoryId);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'product') {
                    setPreviewImage(reader.result);
                    setFormData({ ...formData, productImage: file });
                } else {
                    setPreviewBrandImage(reader.result);
                    setFormData({ ...formData, brandImage: file });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const formDataToSend = new FormData();
        formDataToSend.append('productName', formData.productName);
        formDataToSend.append('categoryId', formData.categoryId);
        formDataToSend.append('subcategoryId', formData.subcategoryId);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('color', formData.color);
        formDataToSend.append('brand', formData.brand);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('about', formData.about);
        
        if (formData.productImage) {
            formDataToSend.append('productImage', formData.productImage);
        }
        if (formData.brandImage) {
            formDataToSend.append('brandImage', formData.brandImage);
        }

        try {
            if (editingProduct) {
                await axios.put(`http://localhost:8081/api/products/${editingProduct.productId}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Product updated successfully!');
            } else {
                await axios.post('http://localhost:8081/api/products/add', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Product added successfully!');
            }
            setShowAddForm(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            productName: product.productName,
            categoryId: product.categoryId || '',
            subcategoryId: product.subcategoryId || '',
            price: product.price,
            color: product.color || '',
            brand: product.brand || '',
            description: product.description || '',
            about: product.about || '',
            brandImage: null,
            productImage: null
        });
        // Show preview for existing images
        if (product.productImage) {
            setPreviewImage(`http://localhost:8081/${product.productImage}`);
        }
        if (product.brandImage) {
            setPreviewBrandImage(`http://localhost:8081/${product.brandImage}`);
        }
        setShowAddForm(true);
    };

    const resetForm = () => {
        setFormData({
            productName: '',
            categoryId: '',
            subcategoryId: '',
            price: '',
            color: '',
            brand: '',
            description: '',
            about: '',
            brandImage: null,
            productImage: null
        });
        setPreviewImage(null);
        setPreviewBrandImage(null);
        setEditingProduct(null);
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:8081/api/products/${productId}`);
                fetchProducts();
                alert('Product deleted successfully');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            }
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // If it's already a full URL, return it
        if (imagePath.startsWith('http')) return imagePath;
        // Remove leading slash if present
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `http://localhost:8081/${cleanPath}`;
    };

    const handleImageError = (productId) => {
        setImageError(prev => ({ ...prev, [productId]: true }));
    };

    const filteredProducts = selectedCategory 
        ? products.filter(p => p.categoryName === selectedCategory)
        : products;

    return (
        <div className="products-container">
            {/* Header */}
            <div className="products-header">
                <h1>Products Management</h1>
                <button className="add-product-btn" onClick={() => setShowAddForm(true)}>
                    Add New Product
                </button>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                <h3>Filter by Category</h3>
                <div className="category-buttons">
                    <button 
                        className={`cat-btn ${selectedCategory === '' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('')}
                    >
                        All Products
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.categoryId}
                            className={`cat-btn ${selectedCategory === cat.categoryName ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.categoryName)}
                        >
                            {cat.icon} {cat.categoryName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="stats-summary">
                <div className="stat-box">
                    <div className="stat-value">{products.length}</div>
                    <div className="stat-label">Total Products</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{categories.length}</div>
                    <div className="stat-label">Categories</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{products.filter(p => p.qrCode).length}</div>
                    <div className="stat-label">QR Generated</div>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="loading-spinner">Loading products...</div>
            ) : (
                <div className="products-grid">
                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <p>No products found. Click "Add New Product" to get started.</p>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <div key={product.productId} className="product-card">
                                <div className="product-image">
                                    {product.productImage && !imageError[product.productId] ? (
                                        <img 
                                            src={getImageUrl(product.productImage)} 
                                            alt={product.productName}
                                            onError={() => handleImageError(product.productId)}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="image-placeholder">
                                            <span>📦</span>
                                            <p>No Image</p>
                                        </div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3>{product.productName}</h3>
                                    <p className="product-category">{product.categoryName}</p>
                                    <p className="product-price">₹{product.price}</p>
                                    {product.color && (
                                        <div className="product-color">
                                            <span 
                                                className="color-dot" 
                                                style={{ backgroundColor: product.color }}
                                                title={getColorName(product.color)}
                                            ></span>
                                            <span className="color-name">{getColorName(product.color)}</span>
                                        </div>
                                    )}
                                    <div className="product-actions">
                                        <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(product.productId)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add/Edit Product Modal */}
            {showAddForm && (
                <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="product-form">
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter product name"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select 
                                        name="categoryId" 
                                        value={formData.categoryId} 
                                        onChange={handleCategoryChange}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                {cat.icon} {cat.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Sub-Category *</label>
                                    <select 
                                        name="subcategoryId" 
                                        value={formData.subcategoryId} 
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.categoryId}
                                    >
                                        <option value="">Select Sub-Category</option>
                                        {subcategories.map(sub => (
                                            <option key={sub.subcategoryId} value={sub.subcategoryId}>
                                                {sub.subcategoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter price"
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Enter brand name"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Color</label>
                                <div className="color-picker">
                                    {colorOptions.map(color => (
                                        <div
                                            key={color.hex}
                                            className={`color-option ${formData.color === color.hex ? 'selected' : ''}`}
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => setFormData({ ...formData, color: color.hex })}
                                            title={color.name}
                                        >
                                            <span className="color-tooltip">{color.name}</span>
                                        </div>
                                    ))}
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        placeholder="Or enter hex code (e.g., #FF6B9D)"
                                        className="color-input"
                                    />
                                </div>
                                {formData.color && (
                                    <div className="selected-color-info">
                                        Selected: <span className="color-name-display">{getColorName(formData.color)}</span>
                                        <span className="color-hex-display">({formData.color})</span>
                                    </div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Product Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'product')}
                                    />
                                    {previewImage && (
                                        <div className="image-preview">
                                            <img src={previewImage} alt="Product preview" />
                                            <button type="button" className="remove-image" onClick={() => {
                                                setPreviewImage(null);
                                                setFormData({ ...formData, productImage: null });
                                            }}>×</button>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Brand Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'brand')}
                                    />
                                    {previewBrandImage && (
                                        <div className="image-preview">
                                            <img src={previewBrandImage} alt="Brand preview" />
                                            <button type="button" className="remove-image" onClick={() => {
                                                setPreviewBrandImage(null);
                                                setFormData({ ...formData, brandImage: null });
                                            }}>×</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Enter product description"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Additional Information</label>
                                <textarea
                                    name="about"
                                    value={formData.about}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Enter additional information"
                                ></textarea>
                            </div>

                            <div className="form-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;