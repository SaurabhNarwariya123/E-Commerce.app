import React from 'react'

const Title = ({text1,text2,large=false}) => {
  return (
    <div className='inline-flex items-center gap-3 mb-3'>
      <p className={`prata-regular text-gray-500 tracking-wide ${large ? 'text-2xl sm:text-4xl' : ''}`}> {text1} <span className='gold-gradient-text font-medium'>{text2}</span></p>
      <p className={`${large ? 'w-10 sm:w-16' : 'w-8 sm:w-12'} h-0.5 bg-linear-to-r from-gold-dark via-gold to-rose rounded-full`}></p>
    </div>
  )
}

export default Title;
