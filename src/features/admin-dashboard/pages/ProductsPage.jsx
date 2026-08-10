import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import { uploadImageToSupabase } from '../../../config/supabaseClient';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Filter,
  Package,
  Image as ImageIcon,
  Tag,
  GitBranch,
  Trash
} from 'lucide-react';
import './ProductsPage.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size] = useState(8);

  // Forms Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: '',
    sku: '',
    imageUrl: '',
  });

  // Categories Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryImageFile, setCategoryImageFile] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [categoryUploading, setCategoryUploading] = useState(false);

  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categoryFileInputKey, setCategoryFileInputKey] = useState(Date.now());

  // Variants Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variantsList, setVariantsList] = useState([]);
  const [variantForm, setVariantForm] = useState({
    size: '',
    color: '',
    stockQuantity: '',
    imageUrl: ''
  });
  const [variantImageFile, setVariantImageFile] = useState(null);
  const [variantImagePreview, setVariantImagePreview] = useState(null);
  const [variantUploading, setVariantUploading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Revoke Blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Fetch Categories from Backend API
  const fetchCategories = async () => {
    try {
      const getCategoriesFn = adminApi.getCategories || adminApi.getAllCategories;
      if (!getCategoriesFn) return;

      const response = await getCategoriesFn();
      if (response?.data) {
        const catList = Array.isArray(response.data) 
          ? response.data 
          : response.data.content || response.data.categories || [];
        setCategories(catList);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search || undefined,
        category: category || undefined,
        page: page,
        size: size,
      };
      const response = await adminApi.getProducts(params);
      if (response.data) {
        setProducts(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load products list:', err);
      setError('Could not connect to Spring Boot products endpoint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      category: '',
      sku: '',
      imageUrl: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setIsEditMode(true);
    setEditingId(product.id);
    
    const catName = product.category?.name || product.category || '';
    const imgUrl = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0].imageUrl : '');

    setFormData({
      name: product.name || '',
      description: product.description || '',
      basePrice: product.basePrice || '',
      category: catName,
      sku: product.sku || '',
      imageUrl: imgUrl,
    });
    setImageFile(null);
    setImagePreview(imgUrl);
    setIsModalOpen(true);
  };

  // Input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // File change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete/deactivate this product?')) {
      return;
    }
    try {
      await adminApi.deleteProduct(id);
      showToast('Product deactivated successfully.', 'success');
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete product.', 'error');
    }
  };

  // Submit Product Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.basePrice || !formData.category) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setUploading(true);
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        try {
          showToast('Uploading product image to Supabase Storage...', 'info');
          finalImageUrl = await uploadImageToSupabase(imageFile, 'product-images');
        } catch (uploadErr) {
          console.error(uploadErr);
          showToast(`Image upload failed: ${uploadErr.message}`, 'error');
          setUploading(false);
          return;
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        category: formData.category,
        sku: formData.sku || `SKU-${Date.now().toString().slice(-6)}`,
        imageUrl: finalImageUrl,
      };

      if (isEditMode) {
        await adminApi.updateProduct(editingId, payload);
        showToast('Product updated successfully.', 'success');
      } else {
        await adminApi.createProduct(payload);
        showToast('Product created successfully.', 'success');
      }

      setIsModalOpen(false);
      setPage(0);
      fetchProducts();
    } catch (err) {
      console.error(err);
      showToast('Failed to save product details to server.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Categories Modal Operations

const handleAddCategory = async (e) => {
  e.preventDefault();
  if (!newCategoryName.trim()) return;

  try {
    setCategoryUploading(true);
    let catImageUrl = '';

    // 1. Upload image to Supabase Storage if file is attached
    if (categoryImageFile) {
      showToast('Uploading category image to Supabase Storage...', 'info');
      catImageUrl = await uploadImageToSupabase(categoryImageFile, 'product-images');
    }

    // 2. Safe order calculation (avoids duplicate positions)
    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map(c => c.displayOrder || 0)) 
      : 0;

    // 3. Payload sent to backend matching CategoryRequest DTO
    await adminApi.createCategory({
      name: newCategoryName.trim(),
      description: newCategoryDescription ? newCategoryDescription.trim() : '',
      imageUrl: catImageUrl,
      displayOrder: maxOrder + 1
    });

    // 4. Success feedback & State resets
    showToast('Category created successfully.', 'success');
    setNewCategoryName('');
    setNewCategoryDescription('');
    setCategoryImageFile(null);
    setCategoryImagePreview(null);
    setCategoryFileInputKey(Date.now()); // Resets DOM file input element
    
    // 5. Refresh category listing
    fetchCategories();
  } catch (err) {
    console.error(err);
    const backendMessage = err.response?.data?.message || 'Failed to create category.';
    showToast(backendMessage, 'error');
  } finally {
    setCategoryUploading(false);
  }
};

  // Variants Modal Operations
  const openVariantModal = (product) => {
    setSelectedProduct(product);
    setVariantsList(product.variants || []);
    setVariantForm({
      size: '',
      color: '',
      stockQuantity: '',
      imageUrl: ''
    });
    setVariantImageFile(null);
    setVariantImagePreview(null);
    setIsVariantModalOpen(true);
  };

  const handleVariantFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVariantImageFile(file);
      setVariantImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!variantForm.size || !variantForm.color || !variantForm.stockQuantity) {
      showToast('Please fill in Size, Color, and Stock.', 'error');
      return;
    }

    try {
      setVariantUploading(true);
      let vImageUrl = variantForm.imageUrl;

      if (variantImageFile) {
        showToast('Uploading variant image to Supabase Storage...', 'info');
        vImageUrl = await uploadImageToSupabase(variantImageFile, 'product-images');
      }

      const newVariantPayload = [{
        size: variantForm.size,
        color: variantForm.color,
        stockQuantity: parseInt(variantForm.stockQuantity, 10),
        imageUrls: vImageUrl ? [vImageUrl] : []
      }];

      await adminApi.addVariants(selectedProduct.id, newVariantPayload);
      showToast('Variant added successfully.', 'success');
      
      // Reset form
      setVariantForm({
        size: '',
        color: '',
        stockQuantity: '',
        imageUrl: ''
      });
      setVariantImageFile(null);
      setVariantImagePreview(null);

      // Refresh product list and variants list
      fetchProducts();
      
      // Fetch latest product details to refresh variants
      const updatedProductRes = await adminApi.getProducts({ search: selectedProduct.name });
      if (updatedProductRes.data) {
        const found = updatedProductRes.data.content.find(p => p.id === selectedProduct.id);
        if (found) {
          setSelectedProduct(found);
          setVariantsList(found.variants || []);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to add variant.', 'error');
    } finally {
      setVariantUploading(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Are you sure you want to delete this variant?')) return;

    try {
      await adminApi.deleteVariant(variantId);
      showToast('Variant deleted successfully.', 'success');
      
      // Refresh list
      fetchProducts();
      setVariantsList(prev => prev.filter(v => v.id !== variantId));
    } catch (err) {
      console.error(err);
      showToast('Failed to delete variant.', 'error');
    }
  };

  return (
    <div className="products-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="header-title">Product Inventory</h1>
          <p className="header-subtitle">Catalog operations, database insertions, and Supabase CDN uploads.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsCategoryModalOpen(true)} className="btn-secondary flex items-center gap-2">
            <Tag size={16} />
            <span>Categories</span>
          </button>
          <button onClick={openAddModal} className="btn-primary">
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field search-input"
          />
          <button type="submit" className="search-icon-btn">
            <Search size={18} />
          </button>
        </form>

        <div className="filter-actions">
          <div className="select-wrapper">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
              className="select-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => {
                const catName = typeof cat === 'string' ? cat : (cat.name || cat.title || 'Unnamed');
                const catValue = typeof cat === 'string' ? cat : (cat.name || cat.id || '');
                return (
                  <option key={cat.id || idx} value={catValue}>
                    {catName}
                  </option>
                );
              })}
            </select>
            <div className="select-icon">
              <Filter size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Products Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="products-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Product</th>
                <th>Title</th>
                {/* <th>Category</th> */}
                <th>Unit Price</th>
                <th>Variants Count</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map(idx => (
                  <tr key={idx} className="skeleton-row">
                    <td><div className="skeleton-box img-skeleton"></div></td>
                    <td><div className="skeleton-box title-skeleton"></div></td>
                    {/* <td><div className="skeleton-box tag-skeleton"></div></td> */}
                    <td><div className="skeleton-box price-skeleton"></div></td>
                    <td><div className="skeleton-box variant-skeleton"></div></td>
                    <td><div className="skeleton-box btn-skeleton"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  // Core image mapping logic
                  const firstImg = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0].imageUrl : null);
                  return (
                    <tr key={product.id}>
                      <td>
                        {firstImg ? (
                          <img src={firstImg} alt={product.name} className="product-thumb" />
                        ) : (
                          <div className="product-thumb-placeholder">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="product-name">{product.name}</div>
                        <div className="product-desc">{product.description || 'No description provided'}</div>
                      </td>
                      {/* <td>
                        <span className="category-badge">
                          {product.category?.name || product.category || 'N/A'}
                        </span>
                      </td> */}
                      <td className="product-price">
                        ₹{(product.basePrice ?? 0).toFixed(2)}
                      </td>
                      <td className="variant-count">
                        <button
                          onClick={() => openVariantModal(product)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-bold transition-all text-xs cursor-pointer bg-indigo-50/50 px-2.5 py-1.5 rounded-lg border border-indigo-100"
                        >
                          <GitBranch size={13} />
                          <span>{product.variants ? product.variants.length : 0} Variant(s)</span>
                        </button>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <button
                            onClick={() => openEditModal(product)}
                            className="btn-action edit"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="btn-action delete"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="pagination-footer">
            <span className="pagination-info">
              Showing Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} items)
            </span>
            <div className="pagination-controls">
              <button
                disabled={page === 0}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                className="btn-secondary"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Drawer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div 
            onClick={() => { if (!uploading) setIsModalOpen(false); }} 
            className="modal-backdrop"
          ></div>
          
          <div className="modal-drawer">
            <div className="modal-header">
              <h3 className="modal-title">
                <Package size={20} className="text-indigo" />
                <span>{isEditMode ? 'Modify Product' : 'Add Product'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={uploading}
                className="btn-icon"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Title *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((cat, idx) => {
                      const catName = typeof cat === 'string' ? cat : (cat.name || cat.title || 'Unnamed');
                      const catValue = typeof cat === 'string' ? cat : (cat.name || cat.id || '');
                      return (
                        <option key={cat.id || idx} value={catValue}>
                          {catName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Base Price (INR) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      required
                      placeholder="29999.00"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Code / SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Virtual SKU code"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Summarize product specifications, dimensions, features..."
                    className="input-field textarea-field"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image (Supabase Upload)</label>
                  <div className="upload-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                    
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} alt="Preview" className="preview-img" />
                        <div className="preview-overlay">
                          Replace image file
                        </div>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <Upload className="upload-icon" />
                        <div className="upload-text">
                          <span className="text-indigo">Upload a file</span>
                        </div>
                        <p className="upload-hint">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Drawer */}
     {isCategoryModalOpen && (
  <div className="modal-overlay">
    <div onClick={() => setIsCategoryModalOpen(false)} className="modal-backdrop"></div>
    <div className="modal-drawer">
      <div className="modal-header">
        <h3 className="modal-title flex items-center gap-2">
          <Tag size={20} className="text-indigo-600" />
          <span>Categories Manager</span>
        </h3>
        <button onClick={() => setIsCategoryModalOpen(false)} className="btn-icon">
          <X size={20} />
        </button>
      </div>

      <div className="modal-form" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
          
          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-3 mb-6">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">Create New Category</h4>
            
            {/* Category Name */}
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                placeholder="e.g. Smart Home"
                className="input-field"
              />
            </div>

            {/* Category Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="e.g. Home automation devices and smart accessories"
                rows={2}
                className="input-field text-xs resize-none"
              />
            </div>

            {/* Category Image File */}
            <div className="form-group">
              <label className="form-label">Category Image File</label>
              <input
                key={categoryFileInputKey}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setCategoryImageFile(file);
                    setCategoryImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="input-field text-xs"
              />
              {categoryImagePreview && (
                <img src={categoryImagePreview} alt="Category preview" className="w-16 h-16 object-cover rounded-lg border mt-2" />
              )}
            </div>

            <button
              type="submit"
              disabled={categoryUploading}
              className="btn-primary w-full text-xs font-semibold py-2 flex items-center justify-center gap-2"
            >
              {categoryUploading ? <Loader2 size={14} className="spinner" /> : <span>Add Category</span>}
            </button>
          </form>

          {/* Categories List */}
          <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-3">
            All Active Categories ({categories.length})
          </h4>
          
          <div className="space-y-2">
            {categories.map((cat, idx) => {
              const catName = typeof cat === 'string' ? cat : (cat.name || cat.title || 'Unnamed');
              const catImage = typeof cat === 'string' ? null : cat.imageUrl;
              const catDesc = typeof cat === 'object' ? cat.description : null;

              return (
                <div key={cat.id || idx} className="p-3 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {catImage ? (
                      <img src={catImage} alt={catName} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 border rounded-lg flex items-center justify-center text-slate-400">
                        <Tag size={16} />
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{catName}</span>
                      {catDesc && <span className="text-xs text-slate-500 line-clamp-1">{catDesc}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  </div>
)}

      {/* Variants Manager Drawer */}
      {isVariantModalOpen && (
        <div className="modal-overlay">
          <div onClick={() => setIsVariantModalOpen(false)} className="modal-backdrop"></div>
          <div className="modal-drawer" style={{ maxWidth: '32rem' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <GitBranch size={20} className="text-indigo" />
                <span>Variants Manager - {selectedProduct?.name}</span>
              </h3>
              <button onClick={() => setIsVariantModalOpen(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            <div className="modal-form" style={{ display: 'flex', flexDirection: 'col', height: '100%', overflow: 'hidden' }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                {/* Add Variant Form */}
                <form onSubmit={handleAddVariant} className="bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl space-y-4 mb-6">
                  <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wide">Add Product Variant</h4>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Size *</label>
                      <input
                        type="text"
                        value={variantForm.size}
                        onChange={(e) => setVariantForm(prev => ({ ...prev, size: e.target.value }))}
                        required
                        placeholder="e.g. XL, 128GB"
                        className="input-field"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Color *</label>
                      <input
                        type="text"
                        value={variantForm.color}
                        onChange={(e) => setVariantForm(prev => ({ ...prev, color: e.target.value }))}
                        required
                        placeholder="e.g. Graphite, Blue"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Stock Quantity *</label>
                      <input
                        type="number"
                        value={variantForm.stockQuantity}
                        onChange={(e) => setVariantForm(prev => ({ ...prev, stockQuantity: e.target.value }))}
                        required
                        placeholder="e.g. 50"
                        className="input-field"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Variant Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVariantFileChange}
                        className="input-field text-xs"
                      />
                    </div>
                  </div>

                  {variantImagePreview && (
                    <div className="flex justify-center bg-white p-2 border border-dashed rounded-lg">
                      <img src={variantImagePreview} alt="Variant preview" className="w-16 h-16 object-cover rounded-lg" />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={variantUploading}
                    className="btn-primary w-full font-semibold py-2"
                  >
                    {variantUploading ? (
                      <>
                        <Loader2 size={16} className="spinner" />
                        <span>Uploading & Creating Variant...</span>
                      </>
                    ) : (
                      <span>Save Variant</span>
                    )}
                  </button>
                </form>

                {/* Variants List Table */}
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide mb-3">All Active Variants ({variantsList.length})</h4>
                {variantsList.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 font-semibold border border-dashed rounded-xl">
                    No variants defined for this product yet.
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {variantsList.map((v) => {
                      // Check for variant specific images
                      const vImage = v.imageUrl || (v.images && v.images.length > 0 ? v.images[0].imageUrl : null);
                      return (
                        <div key={v.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            {vImage ? (
                              <img src={vImage} alt={v.size} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-50 border rounded-lg flex items-center justify-center text-slate-400">
                                <Package size={16} />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                Size: <span className="text-indigo-600">{v.size}</span> | Color: <span className="text-indigo-600">{v.color}</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">Stock Level: <span className="font-bold text-slate-700">{v.stockQuantity} units</span></div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteVariant(v.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Delete Variant"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}