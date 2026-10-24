import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  Package,
  Layers,
  Building2,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  Save,
  Phone,
  MapPin,
  X,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getCategories,
  getCompanies,
  getProducts,
  getShopSettings,
  upsertProduct,
  deleteProduct,
  upsertCategory,
  deleteCategory,
  upsertCompany,
  deleteCompany,
  updateShopPhone,
  uploadProductImage,
  checkCurrentUserRole,
} from '../../lib/supabase';
import type { Category, Company, Product, ProductAvailability } from '../../types';
import { SHOP_INFO } from '../../utils/constants';

type AdminTab = 'overview' | 'products' | 'categories' | 'companies' | 'settings';

export function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdminRole, setIsAdminRole] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);

  // Product Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<{
    name: string;
    price: number | '';
    categoryId: string;
    companyId: string;
    description: string;
    availability: ProductAvailability;
    featured: boolean;
    imageUrl: string;
  }>({
    name: '',
    price: '',
    categoryId: '',
    companyId: '',
    description: '',
    availability: 'available',
    featured: false,
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Category & Company Form States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Product Search in Admin
  const [productSearch, setProductSearch] = useState('');

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'product' | 'category' | 'company';
    id: string;
    name: string;
  } | null>(null);

  // Load all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, comps, prodsRes, settings, roleInfo] = await Promise.all([
        getCategories(),
        getCompanies(),
        getProducts(),
        getShopSettings(),
        checkCurrentUserRole(),
      ]);

      setCategories(cats);
      setCompanies(comps);
      setProducts(prodsRes.products);
      if (settings.phone) {
        setPhone(settings.phone);
      }
      setIsAdminRole(roleInfo.isAdmin);
    } catch (err: unknown) {
      console.error('Error loading dashboard data:', err);
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data.';
      setStatusNotice({ type: 'error', text: message });
    } finally {
      setLoading(false);
    }
  };

  const handleRecheckRole = async () => {
    setCheckingRole(true);
    try {
      const roleInfo = await checkCurrentUserRole();
      setIsAdminRole(roleInfo.isAdmin);
      if (roleInfo.isAdmin) {
        showNotice('success', 'Admin role verified! You now have full access to create and modify products.');
      } else {
        showNotice('error', 'Admin role not detected in public.user_roles yet. Please run the SQL snippet in Supabase SQL Editor.');
      }
    } catch {
      showNotice('error', 'Failed to verify admin role.');
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setStatusNotice({ type, text });
    setTimeout(() => {
      setStatusNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // ----------------------------------------------------------------------------
  // PRODUCT HANDLERS
  // ----------------------------------------------------------------------------
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      price: '',
      categoryId: categories[0]?.id || '',
      companyId: companies[0]?.id || '',
      description: '',
      availability: 'available',
      featured: false,
      imageUrl: '',
    });
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      price: prod.price,
      categoryId: prod.categoryId,
      companyId: prod.companyId,
      description: prod.description || '',
      availability: prod.availability || (prod.inStock ? 'available' : 'out_of_stock'),
      featured: Boolean(prod.featured),
      imageUrl: prod.imageUrl || '',
    });
    setImageFile(null);
    setIsProductModalOpen(true);
  };

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!productForm.name || productForm.price === '' || !productForm.categoryId || !productForm.companyId) {
      showNotice('error', 'Please fill in product name, price, category, and company.');
      return;
    }

    if (isAdminRole === false) {
      showNotice(
        'error',
        `Permission denied: Your account (${user?.email}) has not been granted the 'admin' role in public.user_roles. Please follow the instructions in the banner at the top of the dashboard.`
      );
      return;
    }

    try {
      setSavingProduct(true);
      let finalImageUrl = productForm.imageUrl;

      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await uploadProductImage(imageFile);
        setUploadingImage(false);
      }

      await upsertProduct({
        id: editingProductId || undefined,
        name: productForm.name,
        price: Number(productForm.price),
        categoryId: productForm.categoryId,
        companyId: productForm.companyId,
        description: productForm.description,
        availability: productForm.availability,
        inStock: productForm.availability !== 'out_of_stock',
        featured: productForm.featured,
        imageUrl: finalImageUrl,
      });

      setIsProductModalOpen(false);
      await loadData();
      showNotice('success', `Product "${productForm.name}" saved successfully!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save product.';
      showNotice('error', message);
    } finally {
      setSavingProduct(false);
      setUploadingImage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      if (deleteConfirmation.type === 'product') {
        await deleteProduct(deleteConfirmation.id);
        showNotice('success', `Product "${deleteConfirmation.name}" deleted.`);
      } else if (deleteConfirmation.type === 'category') {
        await deleteCategory(deleteConfirmation.id);
        showNotice('success', `Category "${deleteConfirmation.name}" deleted.`);
      } else if (deleteConfirmation.type === 'company') {
        await deleteCompany(deleteConfirmation.id);
        showNotice('success', `Company "${deleteConfirmation.name}" deleted.`);
      }

      setDeleteConfirmation(null);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Deletion failed.';
      showNotice('error', message);
    }
  };

  // ----------------------------------------------------------------------------
  // CATEGORY HANDLERS
  // ----------------------------------------------------------------------------
  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    const name = editingCategory ? editingCategory.name : newCategoryName;
    const desc = editingCategory ? editingCategory.description : newCategoryDesc;

    if (!name.trim()) return;

    try {
      await upsertCategory({
        id: editingCategory?.id,
        name: name.trim(),
        description: desc?.trim(),
      });
      setNewCategoryName('');
      setNewCategoryDesc('');
      setEditingCategory(null);
      await loadData();
      showNotice('success', `Category "${name}" saved!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save category.';
      showNotice('error', message);
    }
  };

  // ----------------------------------------------------------------------------
  // COMPANY HANDLERS
  // ----------------------------------------------------------------------------
  const handleSaveCompany = async (e: FormEvent) => {
    e.preventDefault();
    const name = editingCompany ? editingCompany.name : newCompanyName;
    const desc = editingCompany ? editingCompany.description : newCompanyDesc;

    if (!name.trim()) return;

    try {
      await upsertCompany({
        id: editingCompany?.id,
        name: name.trim(),
        description: desc?.trim(),
      });
      setNewCompanyName('');
      setNewCompanyDesc('');
      setEditingCompany(null);
      await loadData();
      showNotice('success', `Company "${name}" saved!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save company.';
      showNotice('error', message);
    }
  };

  // ----------------------------------------------------------------------------
  // SHOP SETTINGS HANDLERS
  // ----------------------------------------------------------------------------
  const handleSavePhone = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateShopPhone(phone);
      showNotice('success', 'Shop phone number updated successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update phone number.';
      showNotice('error', message);
    }
  };

  // Filtered Products for Product Tab
  const filteredAdminProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    const catName = categories.find((c) => c.id === p.categoryId)?.name.toLowerCase() || '';
    const compName = companies.find((c) => c.id === p.companyId)?.name.toLowerCase() || '';
    return p.name.toLowerCase().includes(q) || catName.includes(q) || compName.includes(q);
  });

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="loading-bolt-box">
          <Zap size={32} className="spin-pulse-icon" />
        </div>
        <p>Loading Desh Electric dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-bolt-box">
            <Zap size={22} className="sidebar-bolt" />
          </div>
          <div>
            <h2 className="sidebar-title">Desh Electric</h2>
            <span className="sidebar-badge">Admin Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} />
            <span>Products ({products.length})</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <Layers size={18} />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            <Building2 size={18} />
            <span>Companies ({companies.length})</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Shop Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-store-link" target="_blank">
            <ExternalLink size={16} />
            <span>View Public Store</span>
          </Link>

          <div className="sidebar-user-block">
            <span className="user-email-label">{user?.email}</span>
            <button
              type="button"
              className="btn-admin-logout"
              onClick={() => signOut()}
              title="Sign out of Admin Dashboard"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Bar Status Notice */}
        {statusNotice && (
          <div className={`admin-status-toast toast-${statusNotice.type}`} role="alert">
            {statusNotice.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{statusNotice.text}</span>
            <button type="button" onClick={() => setStatusNotice(null)} className="toast-close">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Admin Role Warning Banner */}
        {!loading && isAdminRole === false && (
          <div className="admin-role-warning-banner" role="alert">
            <div className="role-warning-header">
              <div className="role-warning-title-wrap">
                <AlertCircle size={22} className="role-warning-icon" />
                <div>
                  <h3 className="role-warning-title">Administrator Privileges Not Assigned</h3>
                  <p className="role-warning-subtitle">
                    Logged in as <strong>{user?.email}</strong>. This user has not been granted the <code>admin</code> role in <code>public.user_roles</code>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-recheck-role"
                onClick={handleRecheckRole}
                disabled={checkingRole}
              >
                {checkingRole ? 'Verifying...' : 'Check Permission Again'}
              </button>
            </div>
            <div className="role-warning-body">
              <p className="role-warning-text">
                Supabase Row Level Security (RLS) blocks product creation until table privileges and the admin role are granted. To resolve this, open your <strong>Supabase Dashboard &rarr; SQL Editor &rarr; New Query</strong>, run the following SQL, and then click <em>Check Permission Again</em> above:
              </p>
              <pre className="role-warning-sql">
{`-- 1. Grant table & function privileges to authenticated users:
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories, public.companies, public.products, public.shop_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.companies, public.products, public.shop_settings TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- 2. Grant admin role to your authenticated account:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = '${user?.email || 'YOUR_EMAIL@EXAMPLE.COM'}'
ON CONFLICT (user_id, role) DO NOTHING;`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="dashboard-view">
            <div className="view-header">
              <div>
                <h1 className="view-title">Dashboard Overview</h1>
                <p className="view-subtitle">
                  Live metrics for Desh Electric inventory and shop settings.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleOpenAddProduct}
              >
                <Plus size={16} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Metrics Cards */}
            <div className="metrics-grid">
              <div className="metric-card" onClick={() => setActiveTab('products')}>
                <div className="metric-icon-wrap icon-prod">
                  <Package size={24} />
                </div>
                <div>
                  <span className="metric-label">Total Products</span>
                  <div className="metric-value">{products.length}</div>
                </div>
              </div>

              <div className="metric-card" onClick={() => setActiveTab('categories')}>
                <div className="metric-icon-wrap icon-cat">
                  <Layers size={24} />
                </div>
                <div>
                  <span className="metric-label">Product Categories</span>
                  <div className="metric-value">{categories.length}</div>
                </div>
              </div>

              <div className="metric-card" onClick={() => setActiveTab('companies')}>
                <div className="metric-icon-wrap icon-comp">
                  <Building2 size={24} />
                </div>
                <div>
                  <span className="metric-label">Partner Brands</span>
                  <div className="metric-value">{companies.length}</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon-wrap icon-feat">
                  <Zap size={24} />
                </div>
                <div>
                  <span className="metric-label">Featured Items</span>
                  <div className="metric-value">{products.filter((p) => p.featured).length}</div>
                </div>
              </div>
            </div>

            {/* Quick Summary Panels */}
            <div className="overview-panels-grid">
              <div className="summary-panel">
                <div className="panel-header">
                  <h3>Recent Catalog Items</h3>
                  <button
                    type="button"
                    className="panel-view-all"
                    onClick={() => setActiveTab('products')}
                  >
                    View All
                  </button>
                </div>
                <div className="panel-list">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.id} className="panel-list-item">
                      <div className="item-details">
                        <span className="item-name">{p.name}</span>
                        <span className="item-sub">
                          {categories.find((c) => c.id === p.categoryId)?.name} •{' '}
                          {companies.find((c) => c.id === p.companyId)?.name}
                        </span>
                      </div>
                      <div className="item-price">₹{p.price.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="empty-panel-text">No products in database yet. Click "Add New Product" to begin.</p>
                  )}
                </div>
              </div>

              <div className="summary-panel">
                <div className="panel-header">
                  <h3>Shop & Contact Information</h3>
                  <button
                    type="button"
                    className="panel-view-all"
                    onClick={() => setActiveTab('settings')}
                  >
                    Configure
                  </button>
                </div>
                <div className="shop-info-card-summary">
                  <div className="info-summary-row">
                    <span className="info-key">Shop Name:</span>
                    <span className="info-val">{SHOP_INFO.name}</span>
                  </div>
                  <div className="info-summary-row">
                    <span className="info-key">Proprietor:</span>
                    <span className="info-val">{SHOP_INFO.owner}</span>
                  </div>
                  <div className="info-summary-row">
                    <span className="info-key">Location:</span>
                    <span className="info-val">SH6, Manganpur, Purba Bardhaman (741319)</span>
                  </div>
                  <div className="info-summary-row">
                    <span className="info-key">Current Phone:</span>
                    <span className="info-val">
                      {phone ? <strong>{phone}</strong> : <em className="text-muted">Not configured yet</em>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="dashboard-view">
            <div className="view-header">
              <div>
                <h1 className="view-title">Product Catalog</h1>
                <p className="view-subtitle">Manage products, update prices, availability, and photos.</p>
              </div>
              <button
                type="button"
                className="btn-primary-action"
                onClick={handleOpenAddProduct}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Filter / Search Bar */}
            <div className="admin-filter-bar">
              <div className="admin-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products by title, category, or brand..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="admin-search-input"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => setProductSearch('')}
                    className="search-clear"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <span className="admin-results-pill">
                {filteredAdminProducts.length} Products
              </span>
            </div>

            {/* Products Table */}
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price (₹)</th>
                    <th>Availability</th>
                    <th>Featured</th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdminProducts.map((p) => {
                    const cat = categories.find((c) => c.id === p.categoryId);
                    const comp = companies.find((c) => c.id === p.companyId);

                    return (
                      <tr key={p.id}>
                        <td className="product-cell">
                          <div className="product-row-meta">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" className="product-row-thumb" />
                            ) : (
                              <div className="product-thumb-placeholder">
                                <Package size={18} />
                              </div>
                            )}
                            <div>
                              <strong className="product-cell-name">{p.name}</strong>
                              <span className="product-cell-slug">{p.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td>{cat?.name || 'Unassigned'}</td>
                        <td>
                          <span className="brand-pill">{comp?.name || 'Unassigned'}</span>
                        </td>
                        <td className="price-cell">₹{p.price.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`status-badge badge-${p.availability || (p.inStock ? 'available' : 'out_of_stock')}`}>
                            {p.availability === 'out_of_stock'
                              ? 'Out of Stock'
                              : p.availability === 'confirm_availability'
                              ? 'Confirm Availability'
                              : 'Available'}
                          </span>
                        </td>
                        <td>
                          {p.featured ? (
                            <span className="featured-badge">⭐ Featured</span>
                          ) : (
                            <span className="standard-badge">Standard</span>
                          )}
                        </td>
                        <td className="actions-cell">
                          <button
                            type="button"
                            className="btn-table-action action-edit"
                            onClick={() => handleOpenEditProduct(p)}
                            title="Edit product"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-table-action action-delete"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'product',
                                id: p.id,
                                name: p.name,
                              })
                            }
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAdminProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-table-cell">
                        No products found matching "{productSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="dashboard-view">
            <div className="view-header">
              <div>
                <h1 className="view-title">Category Management</h1>
                <p className="view-subtitle">Organize products into electrical departments.</p>
              </div>
            </div>

            <div className="crud-split-grid">
              {/* Left: Add / Edit Category Form */}
              <div className="crud-form-card">
                <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <form onSubmit={handleSaveCategory}>
                  <div className="form-group">
                    <label className="form-label">Category Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Solar & Inverter Systems"
                      value={editingCategory ? editingCategory.name : newCategoryName}
                      onChange={(e) =>
                        editingCategory
                          ? setEditingCategory({ ...editingCategory, name: e.target.value })
                          : setNewCategoryName(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Brief summary of items in this department..."
                      value={editingCategory ? editingCategory.description || '' : newCategoryDesc}
                      onChange={(e) =>
                        editingCategory
                          ? setEditingCategory({ ...editingCategory, description: e.target.value })
                          : setNewCategoryDesc(e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="btn-primary-action">
                      <Save size={16} />
                      <span>{editingCategory ? 'Update Category' : 'Add Category'}</span>
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right: Existing Categories List */}
              <div className="crud-list-card">
                <h3>Existing Categories ({categories.length})</h3>
                <div className="crud-items-list">
                  {categories.map((cat) => {
                    const count = products.filter((p) => p.categoryId === cat.id).length;
                    return (
                      <div key={cat.id} className="crud-item-row">
                        <div className="crud-item-info">
                          <strong className="crud-item-title">{cat.name}</strong>
                          <span className="crud-item-meta">{count} products assigned</span>
                          {cat.description && <p className="crud-item-desc">{cat.description}</p>}
                        </div>
                        <div className="crud-item-actions">
                          <button
                            type="button"
                            className="btn-table-action action-edit"
                            onClick={() => setEditingCategory(cat)}
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-table-action action-delete"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'category',
                                id: cat.id,
                                name: cat.name,
                              })
                            }
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPANIES */}
        {activeTab === 'companies' && (
          <div className="dashboard-view">
            <div className="view-header">
              <div>
                <h1 className="view-title">Brand / Company Management</h1>
                <p className="view-subtitle">
                  Configure manufacturers. Products from the same company can belong to multiple categories.
                </p>
              </div>
            </div>

            <div className="crud-split-grid">
              {/* Left: Add / Edit Company Form */}
              <div className="crud-form-card">
                <h3>{editingCompany ? 'Edit Brand' : 'Add New Brand'}</h3>
                <form onSubmit={handleSaveCompany}>
                  <div className="form-group">
                    <label className="form-label">Brand / Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Havells or Anchor"
                      value={editingCompany ? editingCompany.name : newCompanyName}
                      onChange={(e) =>
                        editingCompany
                          ? setEditingCompany({ ...editingCompany, name: e.target.value })
                          : setNewCompanyName(e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Brand summary and specialties..."
                      value={editingCompany ? editingCompany.description || '' : newCompanyDesc}
                      onChange={(e) =>
                        editingCompany
                          ? setEditingCompany({ ...editingCompany, description: e.target.value })
                          : setNewCompanyDesc(e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="btn-primary-action">
                      <Save size={16} />
                      <span>{editingCompany ? 'Update Brand' : 'Add Brand'}</span>
                    </button>
                    {editingCompany && (
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => setEditingCompany(null)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right: Existing Companies List */}
              <div className="crud-list-card">
                <h3>Existing Partner Brands ({companies.length})</h3>
                <div className="crud-items-list">
                  {companies.map((comp) => {
                    const count = products.filter((p) => p.companyId === comp.id).length;
                    return (
                      <div key={comp.id} className="crud-item-row">
                        <div className="crud-item-info">
                          <strong className="crud-item-title">{comp.name}</strong>
                          <span className="crud-item-meta">{count} products assigned</span>
                          {comp.description && <p className="crud-item-desc">{comp.description}</p>}
                        </div>
                        <div className="crud-item-actions">
                          <button
                            type="button"
                            className="btn-table-action action-edit"
                            onClick={() => setEditingCompany(comp)}
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-table-action action-delete"
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'company',
                                id: comp.id,
                                name: comp.name,
                              })
                            }
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SHOP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="dashboard-view">
            <div className="view-header">
              <div>
                <h1 className="view-title">Shop Settings</h1>
                <p className="view-subtitle">Manage verified business information and phone contact.</p>
              </div>
            </div>

            <div className="settings-cards-grid">
              {/* Verified Details Card (Locked) */}
              <div className="settings-card">
                <h3>Verified Business Registry</h3>
                <p className="settings-card-desc">
                  These verified details originate from the official Google Maps listing and shop establishment records.
                </p>

                <div className="settings-field-group">
                  <label className="settings-field-label">Shop Name</label>
                  <input type="text" className="settings-readonly-input" value={SHOP_INFO.name} readOnly />
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">Proprietor / Owner</label>
                  <input type="text" className="settings-readonly-input" value={SHOP_INFO.owner} readOnly />
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">Physical Address</label>
                  <input
                    type="text"
                    className="settings-readonly-input"
                    value="SH6, Manganpur, Purba Bardhaman, West Bengal 741319"
                    readOnly
                  />
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">Google Maps Directions Link</label>
                  <div className="maps-input-preview">
                    <input
                      type="text"
                      className="settings-readonly-input"
                      value={SHOP_INFO.googleMapsUrl}
                      readOnly
                    />
                    <a
                      href={SHOP_INFO.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-open-maps-preview"
                    >
                      <MapPin size={16} />
                      <span>Test Map</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Editable Phone Number Card */}
              <div className="settings-card">
                <h3>Contact Phone Configuration</h3>
                <p className="settings-card-desc">
                  When you enter the store phone number here and click Save, the public website will immediately display click-to-call buttons.
                </p>

                <form onSubmit={handleSavePhone}>
                  <div className="settings-field-group">
                    <label className="settings-field-label">Shop Mobile / Phone Number</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="field-icon" />
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <span className="field-hint">
                      Leave blank if the store phone number is not ready yet.
                    </span>
                  </div>

                  <button type="submit" className="btn-primary-action">
                    <Save size={16} />
                    <span>Save Phone Number</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content admin-modal-content">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  {editingProductId ? 'Edit Product Item' : 'Add New Product to Catalog'}
                </h3>
                <span className="modal-subtitle">
                  Directly saved to Supabase; updates public website in real time.
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsProductModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="modal-body admin-modal-body">
                {/* Product Name */}
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. JJU Ultra 16A 3-Pin Power Socket"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                {/* Price in INR */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Price in Rupees (₹) *</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 110"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value === '' ? '' : Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  {/* Availability */}
                  <div className="form-group">
                    <label className="form-label">Stock Availability *</label>
                    <select
                      className="form-select"
                      value={productForm.availability}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          availability: e.target.value as ProductAvailability,
                        })
                      }
                    >
                      <option value="available">Available in Store</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="confirm_availability">Please Confirm Availability</option>
                    </select>
                  </div>
                </div>

                {/* Category & Company Selectors */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brand / Company *</label>
                    <select
                      className="form-select"
                      value={productForm.companyId}
                      onChange={(e) => setProductForm({ ...productForm, companyId: e.target.value })}
                      required
                    >
                      {companies.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <div className="image-upload-zone">
                    <input
                      type="file"
                      id="product-image-input"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="product-image-input" className="file-upload-label">
                      <Upload size={20} />
                      <span>{imageFile ? imageFile.name : 'Choose an image file to upload'}</span>
                    </label>
                    {productForm.imageUrl && !imageFile && (
                      <div className="current-image-preview">
                        <img src={productForm.imageUrl} alt="Current" />
                        <span>Current photo saved in database</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Product Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Technical specifications, materials, and warranty information..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Featured Switch */}
                <div className="form-checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    />
                    <span>Highlight as <strong>Featured Item</strong> on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={savingProduct || uploadingImage}
                >
                  <Check size={16} />
                  <span>
                    {uploadingImage
                      ? 'Uploading Image...'
                      : savingProduct
                      ? 'Saving Product...'
                      : 'Save Product'}
                  </span>
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmation && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-content confirmation-modal-content">
            <div className="confirmation-header">
              <div className="confirmation-icon-wrap">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3>Confirm Deletion</h3>
                <p>
                  Are you sure you want to permanently delete this {deleteConfirmation.type}:{' '}
                  <strong>"{deleteConfirmation.name}"</strong>?
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmDelete}
              >
                Delete Permanently
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
