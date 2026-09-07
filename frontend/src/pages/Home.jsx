import React from 'react'
import Hero from '../components/Hero'
import CategoryNav from '../components/CategoryNav'
import FestivalOffers from '../components/FestivalOffers'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import Reveal from '../components/ui/Reveal'

const Home = () => {
  return (
    <div className='relative left-1/2 right-1/2 -mx-[50vw] w-screen'>
      <Hero/>
      <CategoryNav/>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10'>
        <Reveal><FestivalOffers/></Reveal>
        <Reveal><LatestCollection/></Reveal>
        <Reveal><BestSeller/></Reveal>
        <Reveal><OurPolicy/></Reveal>
        <Reveal><NewsletterBox/></Reveal>
      </div>
    </div>
  )
}

export default Home
