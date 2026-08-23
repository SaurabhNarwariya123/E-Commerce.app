import React from 'react'
import Hero from '../components/Hero'
import FestivalOffers from '../components/FestivalOffers'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import Reveal from '../components/ui/Reveal'

const Home = () => {
  return (
    <div>
      <Hero/>
      <Reveal><FestivalOffers/></Reveal>
      <Reveal><LatestCollection/></Reveal>
      <Reveal><BestSeller/></Reveal>
      <Reveal><OurPolicy/></Reveal>
      <Reveal><NewsletterBox/></Reveal>
    </div>
  )
}

export default Home
