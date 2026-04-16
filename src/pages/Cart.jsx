import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import CartItem from '../components/CartItem'
import toast from "react-hot-toast"
import { Link } from 'react-router-dom'

const Cart = () => {
  const user = useSelector((state) => state.auth.user)
  const items = useSelector((state) => state.cart.cart)
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const [loading, setLoading] = useState(false)

  const orderNow = async () => {
    try {
      setLoading(true)

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ items })
      })

      const data = await res.json()

      if (data.success) {

        const options = {
          key: "rzp_test_SdebAbRqQ0vLeT", 
          amount: data.order.amount,
          currency: data.order.currency,
          name: "SHOPI",
          description: "Test Transaction",
          order_id: data.order.id,

          handler: function (response) {
            toast.success("Payment Successful 🎉")
            console.log(response)
          },

          prefill: {
            name: user?.name || "User",
            email: user?.email || "test@gmail.com"
          },

          theme: {
            color: "#3399cc"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

      } else {
        toast.error('Order failed: ' + data.message);
      }

    } catch (error) {
      toast.error('Order failed: ' + error.message);
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center '>
        <div className='p-8 rounded-2xl shadow-xl text-center max-w-md mx-4'>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>Authentication Required</h3>
          <p className='text-gray-600'>Please log in to view your cart.</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center p-8'>
          <h3 className='text-2xl font-bold mt-6 mb-2'>Your Cart is Empty</h3>
          <p className='mb-10'>Looks like you haven't added anything to your cart yet.</p>
          <Link to={"/"} className='bg-blue-600 text-white px-8 py-3 rounded-full'>
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen pt-20'>
      <div className='container mx-auto px-4 py-8'>

        <h1 className='text-2xl font-bold mb-8 text-center'>
          Your Cart ({items.length})
        </h1>

        <div className="flex flex-wrap gap-8 max-w-7xl mx-auto">

          {/* Cart Items */}
          <div className='flex-1'>
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className='w-full lg:w-96'>
            <div className='border rounded-2xl p-6'>

              <h2 className='text-xl font-bold mb-4'>Order Summary</h2>

              <div className='flex justify-between mb-4'>
                <span>Total Items</span>
                <span>{items.length}</span>
              </div>

              <div className='flex justify-between mb-6'>
                <span>Total Price</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>

              <button
                className={`w-full py-3 rounded-xl font-bold ${loading ? 'bg-gray-400' : 'bg-green-600 text-white'}`}
                onClick={orderNow}
                disabled={loading}
              >
                {loading ? "Processing..." : "Secure Checkout"}
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Cart