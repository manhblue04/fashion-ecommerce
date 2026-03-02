import { useState, useEffect } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import HeroBanner from '../../components/home/HeroBanner'
import CategoriesSection from '../../components/home/CategoriesSection'
import FeaturedSection from '../../components/home/FeaturedSection'
import CTABanner from '../../components/home/CTABanner'
import NewArrivalsSection from '../../components/home/NewArrivalsSection'
import BestSellersSection from '../../components/home/BestSellersSection'
import SaleSection from '../../components/home/SaleSection'
import ShopTheLook from '../../components/home/ShopTheLook'
import { getFeaturedProducts, getNewArrivals, getBestSellers, getSaleProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import api from '../../services/api'

export default function HomePage() {
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [sale, setSale] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, catRes, featuredRes, newRes, bestRes, saleRes] = await Promise.all([
          api.get('/banners?type=home'),
          getCategories(),
          getFeaturedProducts(),  
          getNewArrivals(),
          getBestSellers(),
          getSaleProducts(),
        ])
        setBanners(bannersRes.banners)
        setCategories(catRes.categories)
        setFeatured(featuredRes.products)
        setNewArrivals(newRes.products)
        setBestSellers(bestRes.products)
        setSale(saleRes.products)
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div>
      <HeroBanner banners={banners} />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featured} />
      <ShopTheLook />
      <CTABanner />
      <NewArrivalsSection products={newArrivals} />
      <BestSellersSection products={bestSellers} />
      <SaleSection products={sale} />
    </div>
  )
}
