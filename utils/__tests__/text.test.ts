import { getBrandSlug, slug, trimLeadingSlashes, trimSlashes, trimTrailingSlash } from '../text'

describe('text utilities', () => {
  describe('slug', () => {
    it('should convert text to lowercase slug', () => {
      const result = slug('Hello World')
      expect(result).toBe('hello_world')
    })

    it('should replace spaces with underscores', () => {
      const result = slug('Multiple Word Text')
      expect(result).toBe('multiple_word_text')
    })

    it('should remove special characters (commas, quotes, apostrophes)', () => {
      const result = slug("O'Connor, Smith & Co.")
      expect(result).toBe('oconnor_smith_and_co')
    })

    it('should handle cyrillic characters', () => {
      const result = slug('Привет Мир')
      expect(result).toBe('privet_mir')
    })

    it('should handle numbers and hyphens', () => {
      const result = slug('Model-123 Version 2.0')
      expect(result).toBe('model-123_version_20')
    })

    it('should handle empty string', () => {
      const result = slug('')
      expect(result).toBe('')
    })

    it('should handle string with only special characters', () => {
      const result = slug(',..\'"')
      expect(result).toBe('')
    })

    it('should handle ampersand correctly', () => {
      const result = slug('Test & Company')
      expect(result).toBe('test_and_company')
    })

    it('should handle consecutive spaces', () => {
      const result = slug('Multiple   Spaces    Here')
      expect(result).toBe('multiple_spaces_here')
    })

    it('should handle mixed case with numbers', () => {
      const result = slug('iPhone 15 Pro Max')
      expect(result).toBe('iphone_15_pro_max')
    })
  })

  describe('getBrandSlug', () => {
    it('should create slug from lastName only', () => {
      const result = getBrandSlug('Smith')
      expect(result).toBe('smith')
    })

    it('should create slug with firstName and lastName', () => {
      const result = getBrandSlug('Smith', 'John')
      expect(result).toBe('john_smith')
    })

    it('should handle special characters in names', () => {
      const result = getBrandSlug("O'Connor", 'Mary')
      expect(result).toBe('mary_oconnor')
    })

    it('should handle null firstName', () => {
      const result = getBrandSlug('Johnson', null)
      expect(result).toBe('johnson')
    })

    it('should handle undefined firstName', () => {
      const result = getBrandSlug('Brown', undefined)
      expect(result).toBe('brown')
    })

    it('should handle empty string firstName', () => {
      const result = getBrandSlug('Wilson', '')
      expect(result).toBe('wilson')
    })

    it('should handle complex names with spaces', () => {
      const result = getBrandSlug('Van Der Berg', 'Jan Willem')
      expect(result).toBe('jan_willem_van_der_berg')
    })

    it('should handle names with punctuation', () => {
      const result = getBrandSlug('Smith & Co.', 'J.R.')
      expect(result).toBe('jr_smith_and_co')
    })

    it('should handle cyrillic names', () => {
      const result = getBrandSlug('Иванов', 'Иван')
      expect(result).toBe('ivan_ivanov')
    })

    it('should handle names with numbers', () => {
      const result = getBrandSlug('Company 123', 'Model X')
      expect(result).toBe('model_x_company_123')
    })
  })

  describe('trimTrailingSlash', () => {
    it('should remove trailing slash', () => {
      const result = trimTrailingSlash('/api/test/')
      expect(result).toBe('/api/test')
    })

    it('should remove multiple trailing slashes', () => {
      const result = trimTrailingSlash('/api/test///')
      expect(result).toBe('/api/test')
    })

    it('should not change string without trailing slash', () => {
      const result = trimTrailingSlash('/api/test')
      expect(result).toBe('/api/test')
    })
  })

  describe('trimLeadingSlashes', () => {
    it('should remove leading slash', () => {
      const result = trimLeadingSlashes('/api/test')
      expect(result).toBe('api/test')
    })

    it('should remove multiple leading slashes', () => {
      const result = trimLeadingSlashes('///api/test')
      expect(result).toBe('api/test')
    })

    it('should not change string without leading slash', () => {
      const result = trimLeadingSlashes('api/test')
      expect(result).toBe('api/test')
    })
  })

  describe('trimSlashes', () => {
    it('should remove both leading and trailing slashes', () => {
      const result = trimSlashes('/api/test/')
      expect(result).toBe('api/test')
    })

    it('should handle multiple slashes on both sides', () => {
      const result = trimSlashes('///api/test///')
      expect(result).toBe('api/test')
    })

    it('should handle string with no slashes', () => {
      const result = trimSlashes('api/test')
      expect(result).toBe('api/test')
    })
  })
})
