import React from 'react'
import Title from './Title'

const LegalPage = ({ text1, text2, updatedDate, sections }) => {
  return (
    <div className='pt-10 pb-16 border-t border-beige max-w-3xl mx-auto'>
      <div className='text-center mb-3'>
        <Title text1={text1} text2={text2} large />
      </div>
      {updatedDate && (
        <p className='text-center mb-10'>
          <span className='inline-block text-xs text-gold-dark bg-beige-light border border-beige rounded-full px-4 py-1'>Last updated: {updatedDate}</span>
        </p>
      )}

      <div className='flex flex-col gap-4'>
        {sections.map((section, i) => (
          <div key={i} className='flex gap-4 bg-white border border-beige rounded-2xl shadow-sm p-5 sm:p-6 hover:shadow-md hover:border-gold/40 transition-all duration-300'>
            <span className='shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-gold-dark to-gold text-white text-sm font-semibold flex items-center justify-center'>{i + 1}</span>
            <div className='min-w-0'>
              <p className='prata-regular text-charcoal text-lg sm:text-xl mb-2'>{section.heading}</p>
              {Array.isArray(section.body) ? (
                <ul className='text-gray-600 text-sm sm:text-[15px] leading-relaxed flex flex-col gap-2'>
                  {section.body.map((line, j) => (
                    <li key={j} className='flex gap-2.5'>
                      <span className='mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0'></span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-gray-600 text-sm sm:text-[15px] leading-relaxed'>{section.body}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LegalPage
