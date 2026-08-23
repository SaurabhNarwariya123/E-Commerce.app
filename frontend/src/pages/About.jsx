import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'
import Card from '../components/ui/Card'

const About = () => {
  return (
    <div>
       <div className='text-2xl text-center pt-8 border-t border-beige'>
        <Title text1={"ABOUT"} text2={"US"}/>
       </div>

       <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-112.5 rounded-2xl object-cover' src={assets.about_img} alt="" />
           <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 leading-relaxed'>
             <p>Forever began with a simple belief — that fabric is the foundation of how clothing feels, moves, and lasts. We work directly with mills and artisans to source materials that hold up to everyday life without compromising on softness or drape.</p>
             <p>Every piece in our collection is chosen for its quality first. From breathable cottons to structured wools, we curate fabrics that age gracefully and stay true to their shape wash after wash.</p>
             <b className='text-charcoal'>Our mission</b>
             <p>To make thoughtfully sourced, beautifully made essentials accessible — so quality never has to be an afterthought.</p>
           </div>
       </div>

       <div className='text-4xl py-4'>
            <Title  text1={"WHY"}  text2={"CHOOSE US"}/>
       </div>
           <div className='flex flex-col md:flex-row gap-4 text-sm mb-20'>
               <Card className='px-10 md:px-16 py-8 md:py-20 flex flex-col gap-5 flex-1'>
                <b className='text-charcoal'>Quality Assurance</b>
                <p className='text-gray-500 leading-relaxed'>Every fabric is tested for durability, colorfastness, and comfort before it ever reaches our shelves.</p>
                </Card>

                <Card className='px-10 md:px-16 py-8 md:py-20 flex flex-col gap-5 flex-1'>
                <b className='text-charcoal'>Convenience</b>
                <p className='text-gray-500 leading-relaxed'>A seamless shopping experience from browsing to doorstep delivery, with easy returns whenever you need them.</p>
                </Card>

                <Card className='px-10 md:px-16 py-8 md:py-20 flex flex-col gap-5 flex-1'>
                <b className='text-charcoal'>Exceptional Support</b>
                <p className='text-gray-500 leading-relaxed'>Our team is here for you around the clock — real people, ready to help with anything you need.</p>
                </Card>
           </div>
           <NewsletterBox/>
    </div>
  )
}

export default About
