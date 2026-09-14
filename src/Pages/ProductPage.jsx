import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addCartItem,
  updateCartItem,
  selectCartItems,
} from "../Slices/cartSlice";
import { addToWishlist, removeFromWishlist } from "../Slices/wishListSlice";
import {
  fetchProductById,
  clearSelectedProduct,
  selectSelectedProduct,
  selectProductsStatus,
  selectProductsError,
} from "../Slices/productSlice";
import { FiHeart, FiArrowLeft } from "react-icons/fi";
import CommentSection from "../Component/Comment";

const Toast = ({ message }) => (
  <div className="fixed top-5 right-5 z-50 bg-pink-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium animate-slideIn">
    {message}
  </div>
);
const handleImageError = (e) => {
  e.target.onerror = null;
  e.target.src = "/placeholder-product.png";
};
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [toast, setToast] = useState("");

  const product = useSelector(selectSelectedProduct);
  const status = useSelector(selectProductsStatus);
  const error = useSelector(selectProductsError);

  const loading = status.fetchById === "loading";
  const fetchByIdError = error.fetchById;

  const cartItems = useSelector(selectCartItems); // [{ product: {...}, quantity, price, subtotal }]
  const { wishlist: wishlistItems = [] } = useSelector(
    (state) => state.wishlist || {},
  );

  // NOTE: was `state.auth?.user?._id` — there is no "auth" key in store.js,
  // the user slice is registered as "signinuser". This previously made
  // loggedInUserId always null regardless of login state.
  const loggedInUserId = useSelector(
    (state) => state.signinuser?.user?._id ?? null,
  );

  useEffect(() => {
    dispatch(fetchProductById(id));
    setActiveImage(0);
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const existingCartItem = useMemo(
    () => cartItems.find((i) => i.product?._id === product?._id),
    [cartItems, product],
  );

  const isInWishlist = useMemo(
    () => wishlistItems.some((i) => i._id === product?._id),
    [wishlistItems, product],
  );

  // NOTE: no size handling — this backend has no size-variant support on Cart items.
  //
  // FIX: addCartItem's backend service treats `quantity` as ADDITIVE
  // (existingItem.quantity += quantity), not absolute. Previously this
  // always called addCartItem with (existing.quantity + quantity), which
  // the backend then added AGAIN on top of the existing amount, silently
  // doubling up. When the item already exists, use updateCartItem instead,
  // which sets an absolute quantity — same pattern as UserCartPage.jsx.
  const handleAddToCart = () => {
    if (existingCartItem) {
      dispatch(
        updateCartItem({
          productId: product._id,
          quantity: existingCartItem.quantity + quantity,
        }),
      );
    } else {
      dispatch(addCartItem({ productId: product._id, quantity }));
    }
    showToast("✔ Added to cart");
    navigate("/user/cart");
  };

  const toggleWishlist = () => {
    if (!product) return;
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      showToast("💔 Removed from wishlist");
    } else {
      dispatch(addToWishlist(product));
      showToast("❤ Added to wishlist");
    }
  };

  // Loading skeleton
  if (loading || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="h-6 bg-pink-100 w-32 rounded mb-4"></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 aspect-square bg-pink-100 rounded-2xl"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-pink-100 rounded w-1/2"></div>
            <div className="h-4 bg-pink-100 rounded w-1/3"></div>
            <div className="h-4 bg-pink-50 rounded w-full"></div>
            <div className="h-4 bg-pink-50 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchByIdError) {
    return (
      <div className="p-8 text-center text-red-500 font-medium bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto mt-10">
        {fetchByIdError}
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [{ url: product.image }];

  return (
    <div className="bg-linear-to-b from-pink-50 via-white to-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {toast && <Toast message={toast} />}

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-pink-100 text-pink-600 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors"
        >
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-8 bg-white shadow-sm border border-pink-100 rounded-3xl p-6 md:p-8">
          {/* IMAGE */}
          <div className="md:w-2/5 shrink-0">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-pink-50">
              <img
                src={images[activeImage]?.url}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
              <button
                onClick={toggleWishlist}
                aria-label="Toggle wishlist"
                className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md transition-colors ${
                  isInWishlist
                    ? "text-pink-500"
                    : "text-gray-400 hover:text-pink-400"
                }`}
              >
                <FiHeart
                  size={18}
                  fill={isInWishlist ? "currentColor" : "none"}
                />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((img, i) => (
                  <button
                    key={img.url + i}
                    onClick={() => setActiveImage(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === activeImage ? "border-pink-400" : "border-pink-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex-1 space-y-4">
            {product.category && (
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-wide">
                {product.category}
              </span>
            )}

            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>

            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-pink-600">
                Rs. {product.price?.toFixed(0)}
              </p>
              {product.comparePrice > product.price && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    Rs. {product.comparePrice.toFixed(0)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    -
                    {Math.round(
                      ((product.comparePrice - product.price) /
                        product.comparePrice) *
                        100,
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description}
            </p>

            <p className="text-xs font-medium text-pink-400">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border border-pink-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 text-pink-500 hover:bg-pink-50"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock || 99, q + 1))
                  }
                  className="w-9 h-9 text-pink-500 hover:bg-pink-50"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 px-6 py-2.5 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-10">
          <CommentSection
            postId={product._id}
            loggedInUserId={loggedInUserId}
          />
        </div>
      </div>
    </div>
  );
}
