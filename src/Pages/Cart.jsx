// import { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchCart,
//   addTocart,
//   updateCartQuantity,
//   deleteCartItem,
// } from "../Slices/cartSlice";
// import { fetchProducts } from "../Slices/productSlice"; // ← dummyjson products
// import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";

// const Skeleton = () => (
//   <div className="animate-pulse p-4 border border-pink-100 rounded-lg flex items-center gap-4">
//     <div className="w-16 h-16 bg-pink-200 rounded"></div>
//     <div className="flex-1 space-y-2">
//       <div className="h-4 bg-pink-200 rounded"></div>
//       <div className="h-4 bg-pink-100 rounded w-1/2"></div>
//     </div>
//   </div>
// );

// export default function UserCartPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { items: products = [], loading: productsLoading } = useSelector(
//     (state) => state.products,
//   );

//   const {
//     cart = [],
//     loading: cartLoading,
//     error,
//   } = useSelector((state) => state.cart);

//   const loading = productsLoading || cartLoading;

//   useEffect(() => {
//     dispatch(fetchProducts()); // ← dummyjson
//     dispatch(fetchCart()); // ← localStorage
//   }, [dispatch]);

//   const subtotal = useMemo(
//     () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
//     [cart],
//   );

//   const handleAddToCart = (productItem) => {
//     const existing = cart.find((i) => i.id === productItem.id);
//     if (existing) {
//       dispatch(
//         updateCartQuantity({
//           id: existing.id,
//           size: existing.size,
//           quantity: existing.quantity + 1,
//         }),
//       );
//     } else {
//       dispatch(addTocart({ ...productItem, size: "M", quantity: 1 }));
//     }
//   };

//   const handleQuantityChange = (item, change) => {
//     const newQty = item.quantity + change;
//     if (newQty <= 0) {
//       dispatch(deleteCartItem({ id: item.id, size: item.size }));
//     } else {
//       dispatch(
//         updateCartQuantity({ id: item.id, size: item.size, quantity: newQty }),
//       );
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-6 bg-pink-50/40 min-h-screen">
//       <h1 className="text-3xl font-bold mb-6 text-pink-700 flex items-center gap-2">
//         🛍️ My Cart
//       </h1>

//       {error && (
//         <div className="mb-4 p-3 bg-rose-100 text-rose-700 border border-rose-300 rounded">
//           {error}
//         </div>
//       )}

//       <div className="grid md:grid-cols-3 gap-6">
//         {/* PRODUCTS */}
//         <div className="md:col-span-2 bg-white shadow-md shadow-pink-100 rounded-lg p-4 border border-pink-100">
//           <h2 className="text-xl font-semibold mb-4 text-pink-700">Products</h2>

//           {loading ? (
//             <div className="space-y-4">
//               <Skeleton />
//               <Skeleton />
//               <Skeleton />
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {products.map((p) => (
//                 <div
//                   key={p.id}
//                   className="flex justify-between items-center p-3 border border-pink-100 rounded-md shadow-sm hover:shadow-md hover:shadow-pink-100 hover:border-pink-200 transition"
//                 >
//                   <div className="flex items-center gap-4">
//                     <img
//                       src={p.image} // ← normalized in slice (thumbnail → image)
//                       alt={p.title}
//                       className="w-16 h-16 rounded object-cover ring-1 ring-pink-100"
//                     />
//                     <div>
//                       <h3 className="font-semibold text-sm text-gray-800">
//                         {p.title}
//                       </h3>
//                       <p className="text-pink-600 text-sm font-medium">
//                         ${p.price.toFixed(2)}
//                       </p>
//                       {p.stock === 0 && (
//                         <span className="text-xs text-rose-500">
//                           Out of stock
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <button
//                     disabled={p.stock === 0}
//                     onClick={() => handleAddToCart(p)}
//                     className="bg-pink-500 text-white px-4 py-1 rounded-full hover:bg-pink-600 transition disabled:opacity-50 shadow-sm"
//                   >
//                     Add
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* CART */}
//         <div className="bg-white shadow-md shadow-pink-100 rounded-lg p-4 border border-pink-100">
//           <h2 className="text-xl font-semibold mb-4 text-pink-700">
//             Your Cart
//           </h2>

//           {cart.length === 0 ? (
//             <div className="text-center py-10 text-pink-400">
//               🌸 Your cart is empty
//               <p className="text-sm mt-1 text-pink-300">
//                 Add items from the left section
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {cart.map((item, index) => (
//                 <div
//                   key={`${item.id}-${item.size}-${index}`}
//                   className="flex justify-between items-center border border-pink-100 rounded p-3"
//                 >
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={item.image}
//                       alt={item.title}
//                       className="w-14 h-14 rounded object-cover ring-1 ring-pink-100"
//                     />
//                     <div>
//                       <p className="font-medium text-sm text-gray-800">
//                         {item.title}
//                       </p>
//                       <p className="text-pink-300 text-xs">Size: {item.size}</p>
//                       <p className="text-pink-600 text-sm font-medium">
//                         ${(item.price * item.quantity).toFixed(2)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => handleQuantityChange(item, -1)}
//                       className="p-1 bg-pink-100 text-pink-600 rounded hover:bg-pink-200"
//                     >
//                       <FiMinus />
//                     </button>

//                     <span className="w-6 text-center font-semibold text-gray-800">
//                       {item.quantity}
//                     </span>

//                     <button
//                       onClick={() => handleQuantityChange(item, 1)}
//                       className="p-1 bg-pink-100 text-pink-600 rounded hover:bg-pink-200"
//                     >
//                       <FiPlus />
//                     </button>

//                     <button
//                       onClick={() =>
//                         dispatch(
//                           deleteCartItem({ id: item.id, size: item.size }),
//                         )
//                       }
//                       className="text-rose-500 hover:text-rose-600 text-xl"
//                     >
//                       <FiTrash2 />
//                     </button>
//                   </div>
//                 </div>
//               ))}

//               <div className="border-t border-pink-100 pt-3 mt-3">
//                 <div className="flex justify-between font-semibold text-gray-800">
//                   <span>Subtotal</span>
//                   <span className="text-pink-600">${subtotal.toFixed(2)}</span>
//                 </div>

//                 <button
//                   disabled={cart.length === 0}
//                   onClick={() => navigate("/checkout")}
//                   className="mt-4 w-full py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition disabled:opacity-50 shadow-sm shadow-pink-200"
//                 >
//                   Proceed to Checkout
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  selectCartItems,
  selectCartLoading,
  selectCartMutating,
  selectCartError,
} from "../Slices/cartSlice";
import { fetchProducts } from "../Slices/productSlice";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Skeleton = () => (
  <div className="animate-pulse p-4 border border-pink-100 rounded-lg flex items-center gap-4">
    <div className="w-16 h-16 bg-pink-200 rounded"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-pink-200 rounded"></div>
      <div className="h-4 bg-pink-100 rounded w-1/2"></div>
    </div>
  </div>
);

export default function UserCartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: products = [], loading: productsLoading } = useSelector(
    (state) => state.products,
  );

  const cartItems = useSelector(selectCartItems); // [{ product: {...}, quantity, price, subtotal }]
  const cartLoading = useSelector(selectCartLoading);
  const cartMutating = useSelector(selectCartMutating);
  const error = useSelector(selectCartError);

  const loading = productsLoading || cartLoading;

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCart());
  }, [dispatch]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  // NOTE: no size handling — this backend has no size-variant support on Cart items.
  const handleAddToCart = (productItem) => {
    const existing = cartItems.find((i) => i.product?._id === productItem._id);
    if (existing) {
      dispatch(
        updateCartItem({
          productId: productItem._id,
          quantity: existing.quantity + 1,
        }),
      );
    } else {
      dispatch(addCartItem({ productId: productItem._id, quantity: 1 }));
    }
  };

  const handleQuantityChange = (item, change) => {
    const newQty = item.quantity + change;
    if (newQty <= 0) {
      dispatch(removeCartItem(item.product._id));
    } else {
      dispatch(
        updateCartItem({ productId: item.product._id, quantity: newQty }),
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-pink-50/40 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-pink-700 flex items-center gap-2">
        🛍️ My Cart
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-rose-100 text-rose-700 border border-rose-300 rounded">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* PRODUCTS */}
        <div className="md:col-span-2 bg-white shadow-md shadow-pink-100 rounded-lg p-4 border border-pink-100">
          <h2 className="text-xl font-semibold mb-4 text-pink-700">Products</h2>

          {loading ? (
            <div className="space-y-4">
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center p-3 border border-pink-100 rounded-md shadow-sm hover:shadow-md hover:shadow-pink-100 hover:border-pink-200 transition"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={p.images?.[0]?.url || p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded object-cover ring-1 ring-pink-100"
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-gray-800">
                        {p.name}
                      </h3>
                      <p className="text-pink-600 text-sm font-medium">
                        Rs. {p.price?.toFixed(0)}
                      </p>
                      {p.stock === 0 && (
                        <span className="text-xs text-rose-500">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={p.stock === 0 || cartMutating}
                    onClick={() => handleAddToCart(p)}
                    className="bg-pink-500 text-white px-4 py-1 rounded-full hover:bg-pink-600 transition disabled:opacity-50 shadow-sm"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CART */}
        <div className="bg-white shadow-md shadow-pink-100 rounded-lg p-4 border border-pink-100">
          <h2 className="text-xl font-semibold mb-4 text-pink-700">
            Your Cart
          </h2>

          {cartItems.length === 0 ? (
            <div className="text-center py-10 text-pink-400">
              🌸 Your cart is empty
              <p className="text-sm mt-1 text-pink-300">
                Add items from the left section
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  className="flex justify-between items-center border border-pink-100 rounded p-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images?.[0]?.url || item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded object-cover ring-1 ring-pink-100"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-pink-600 text-sm font-medium">
                        Rs. {(item.price * item.quantity).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={cartMutating}
                      onClick={() => handleQuantityChange(item, -1)}
                      className="p-1 bg-pink-100 text-pink-600 rounded hover:bg-pink-200 disabled:opacity-50"
                    >
                      <FiMinus />
                    </button>

                    <span className="w-6 text-center font-semibold text-gray-800">
                      {item.quantity}
                    </span>

                    <button
                      disabled={cartMutating}
                      onClick={() => handleQuantityChange(item, 1)}
                      className="p-1 bg-pink-100 text-pink-600 rounded hover:bg-pink-200 disabled:opacity-50"
                    >
                      <FiPlus />
                    </button>

                    <button
                      disabled={cartMutating}
                      onClick={() => dispatch(removeCartItem(item.product._id))}
                      className="text-rose-500 hover:text-rose-600 text-xl disabled:opacity-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t border-pink-100 pt-3 mt-3">
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Subtotal</span>
                  <span className="text-pink-600">
                    Rs. {subtotal.toFixed(0)}
                  </span>
                </div>

                <button
                  disabled={cartItems.length === 0}
                  onClick={() => navigate("/checkout")}
                  className="mt-4 w-full py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition disabled:opacity-50 shadow-sm shadow-pink-200"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
