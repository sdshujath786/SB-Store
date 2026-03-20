// ========== COMPLETE PRODUCTS DATABASE WITH FILTERS ==========
// This replaces your entire products-data.js file

// First, load products from admin (your existing function)
function loadProductsFromAdmin() {
    const adminProducts = localStorage.getItem('sbstore_products');
    if (adminProducts) {
        try {
            return JSON.parse(adminProducts);
        } catch (e) {
            console.error('Error parsing admin products', e);
            return [];
        }
    }
    return []; // Empty array fallback
}

// Products Database - SINGLE DECLARATION
const ProductsDatabase = {
    // Get all products (works with your admin products)
    getAllProducts: function() {
        // Try to get from admin first
        const adminProducts = loadProductsFromAdmin();
        if (adminProducts && adminProducts.length > 0) {
            return adminProducts;
        }
        
        // Default products if none in admin
        return [
            {
                id: 101,
                name: "Sony WH-1000XM5 Wireless Headphones",
                price: 399.99,
                salePrice: 329.99,
                rating: 4.8,
                reviews: 1245,
                image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500",
                category: "Electronics",
                subcategory: "Audio",
                brand: "Sony",
                description: "Industry-leading noise cancellation",
                inStock: true,
                discount: 17,
                features: ["Noise cancelling", "30-hour battery"],
                tags: ["headphones", "wireless", "audio"]
            },
            {
                id: 102,
                name: "Samsung Galaxy S24 Ultra",
                price: 1299.99,
                salePrice: 1149.99,
                rating: 4.9,
                reviews: 890,
                image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
                category: "Electronics",
                subcategory: "Mobiles",
                brand: "Samsung",
                description: "AI-powered camera with S Pen",
                inStock: true,
                discount: 12,
                features: ["200MP Camera", "S Pen"],
                tags: ["smartphone", "android", "samsung"]
            },
            {
                id: 103,
                name: "Nike Air Max 270",
                price: 149.99,
                salePrice: 129.99,
                rating: 4.6,
                reviews: 2341,
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
                category: "Fashion",
                subcategory: "Footwear",
                brand: "Nike",
                description: "Men's lifestyle shoe",
                inStock: true,
                discount: 13,
                features: ["Max Air unit", "Breathable mesh"],
                tags: ["shoes", "sneakers", "nike"]
            },
            {
                id: 104,
                name: "Apple MacBook Pro 16",
                price: 2499.99,
                salePrice: 2299.99,
                rating: 4.9,
                reviews: 567,
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
                category: "Electronics",
                subcategory: "Laptops",
                brand: "Apple",
                description: "M3 Max chip, 48GB RAM",
                inStock: true,
                discount: 8,
                features: ["M3 Max", "Liquid Retina"],
                tags: ["laptop", "apple", "macbook"]
            },
            {
                id: 105,
                name: "Levi's 501 Original Jeans",
                price: 89.99,
                salePrice: 69.99,
                rating: 4.5,
                reviews: 1890,
                image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
                category: "Fashion",
                subcategory: "Clothing",
                brand: "Levi's",
                description: "Classic straight-fit jeans",
                inStock: true,
                discount: 22,
                features: ["100% Cotton", "Button fly"],
                tags: ["jeans", "clothing", "levis"]
            },
            {
                id: 106,
                name: "Dyson V15 Detect Vacuum",
                price: 699.99,
                salePrice: 599.99,
                rating: 4.7,
                reviews: 892,
                image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
                category: "Home",
                subcategory: "Appliances",
                brand: "Dyson",
                description: "Cordless vacuum with laser",
                inStock: true,
                discount: 14,
                features: ["Laser detection", "60 min battery"],
                tags: ["vacuum", "cleaning", "dyson"]
            },
            {
                id: 107,
                name: "Adidas Ultraboost 22",
                price: 179.99,
                salePrice: 149.99,
                rating: 4.6,
                reviews: 2341,
                image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
                category: "Sports",
                subcategory: "Footwear",
                brand: "Adidas",
                description: "Running shoes with boost technology",
                inStock: true,
                discount: 16,
                features: ["Boost midsole", "Primeknit upper"],
                tags: ["running", "shoes", "adidas"]
            },
            {
                id: 108,
                name: "Sony PlayStation 5",
                price: 499.99,
                salePrice: 449.99,
                rating: 4.9,
                reviews: 3456,
                image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
                category: "Gaming",
                subcategory: "Consoles",
                brand: "Sony",
                description: "Next-gen gaming console",
                inStock: false,
                discount: 10,
                features: ["4K gaming", "SSD storage"],
                tags: ["gaming", "console", "playstation"]
            }
        ];
    },

    // Get unique categories from products
    getCategories: function() {
        const products = this.getAllProducts();
        const categories = [...new Set(products.map(p => p.category))];
        return categories.sort();
    },

    // Get unique brands from products
    getBrands: function() {
        const products = this.getAllProducts();
        const brands = [...new Set(products.map(p => p.brand))];
        return brands.sort();
    },

    // Get price range (min/max)
    getPriceRange: function() {
        const products = this.getAllProducts();
        const prices = products.map(p => p.salePrice || p.price);
        return {
            min: Math.floor(Math.min(...prices)),
            max: Math.ceil(Math.max(...prices))
        };
    },

    // Filter products based on criteria
    filterProducts: function(filters) {
        let products = this.getAllProducts();
        
        // Category filter
        if (filters.categories && filters.categories.length > 0) {
            products = products.filter(p => 
                filters.categories.includes(p.category)
            );
        }
        
        // Brand filter
        if (filters.brands && filters.brands.length > 0) {
            products = products.filter(p => 
                filters.brands.includes(p.brand)
            );
        }
        
        // Price range filter
        if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
            products = products.filter(p => {
                const price = p.salePrice || p.price;
                return price >= filters.minPrice && price <= filters.maxPrice;
            });
        }
        
        // Rating filter
        if (filters.minRating) {
            products = products.filter(p => p.rating >= filters.minRating);
        }
        
        // Stock filter
        if (filters.inStockOnly) {
            products = products.filter(p => p.inStock === true);
        }
        
        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm)) ||
                (p.tags && p.tags.some(tag => tag.includes(searchTerm)))
            );
        }
        
        return products;
    },

    // Sort products
    sortProducts: function(products, sortBy) {
        const sorted = [...products];
        
        switch(sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => 
                    (a.salePrice || a.price) - (b.salePrice || b.price)
                );
            case 'price-high':
                return sorted.sort((a, b) => 
                    (b.salePrice || b.price) - (a.salePrice || a.price)
                );
            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'newest':
                return sorted.sort((a, b) => b.id - a.id);
            default:
                return sorted;
        }
    },

    // Get star rating HTML
    getStarRating: function(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (halfStar) {
            stars += '½';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        return stars;
    }
};

// Create productsData for backward compatibility (if needed)
const productsData = (function() {
    const products = ProductsDatabase.getAllProducts();
    const grouped = {};
    products.forEach(product => {
        const category = product.category || 'uncategorized';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push(product);
    });
    return grouped;
})();

// Initialize
window.ProductsDB = ProductsDatabase;
window.productsData = productsData; // Keep for backward compatibility