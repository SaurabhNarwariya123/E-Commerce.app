import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div >
       <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={"ABOUT"} text2={"US"}/>
       </div>

       <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
           <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
             <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Veritatis corrupti labore modi ratione iste a, nulla minus nam sequi dicta, eos fugit ipsum blanditiis unde aliquid excepturi. Optio, aperiam inventore!</p>
             <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias neque ex nostrum? Voluptas, fugiat. Excepturi minima perspiciatis iste pariatur nulla vel nobis, debitis quidem quibusdam ad corrupti, rem porro mollitia.</p>
             <b className='text-gray-800'> Our mission</b>
             <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Reprehenderit vitae voluptas labore adipisci dolor praesentium amet dolorem sequi odio tempora, ut optio dicta officia minima repellendus voluptatibus velit exercitationem culpa!</p>
           </div>
       </div>

       <div className='text-4xl py-4'>
            <Title  text1={"WHY"}  text2={"CHOOSE US"}/>
       </div>
           <div className='flex flex-col md:flex-row text-sm mb-20'>
               <div  className='border px-10 md:px-16 py-8 md:py-20 flex flex-col gap-5'>
                <b>Quality Assurance:</b>
                <p className='text-gray-600'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit consectetur nemo, inventore molestiae laboriosam possimus ratione! Porro modi libero dolor inventore sapiente, voluptatem eius consequuntur nisi minima optio blanditiis ipsam!</p>
                </div>

                <div  className='border px-10 md:px-16 py-8 md:py-20 flex flex-col gap-5'>
                <b>Conveniences:</b>
                <p className='text-gray-600'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit consectetur nemo, inventore molestiae laboriosam possimus ratione! Porro modi libero dolor inventore sapiente, voluptatem eius consequuntur nisi minima optio blanditiis ipsam!</p>
                </div>

                <div  className='border px-10 md:px-16 py-8 md:py-20 flex flex-col gap-5'>
                <b>Exceptional Customer Service: </b>
                <p className='text-gray-600'>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Velit consectetur nemo, inventore molestiae laboriosam possimus ratione! Porro modi libero dolor inventore sapiente, voluptatem eius consequuntur nisi minima optio blanditiis ipsam!</p>
                </div>
           </div>
           <NewsletterBox/>
    </div>
  )
}

export default About
