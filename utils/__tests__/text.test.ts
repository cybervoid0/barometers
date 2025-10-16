import {
  fileSlug,
  getBrandFileSlug,
  getBrandSlug,
  slug,
  trimLeadingSlashes,
  trimSlashes,
  trimTrailingSlash,
} from '../text'

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

  describe('fileSlug', () => {
    it('should convert to lowercase', () => {
      expect(fileSlug('UPPERCASE')).toBe('uppercase')
      expect(fileSlug('MixedCase')).toBe('mixedcase')
    })

    it('should replace slashes with underscores', () => {
      expect(fileSlug('Brauckmann/Lessing')).toBe('brauckmann_lessing')
      expect(fileSlug('path/to/file')).toBe('path_to_file')
      expect(fileSlug('multi/level/path/name')).toBe('multi_level_path_name')
    })

    it('should preserve hyphens', () => {
      expect(fileSlug('Model-123')).toBe('model-123')
      expect(fileSlug('pre-release-v2')).toBe('pre-release-v2')
    })

    it('should remove commas, quotes, and apostrophes', () => {
      expect(fileSlug("O'Connor")).toBe('oconnor')
      expect(fileSlug('Test, Inc.')).toBe('test_inc')
      expect(fileSlug('"quoted"')).toBe('quoted')
      expect(fileSlug("it's")).toBe('its')
    })

    it('should handle spaces correctly', () => {
      expect(fileSlug('Hello World')).toBe('hello_world')
      expect(fileSlug('Multiple   Spaces')).toBe('multiple_spaces')
      expect(fileSlug('  leading and trailing  ')).toBe('leading_and_trailing')
    })

    it('should transliterate cyrillic', () => {
      expect(fileSlug('Привет')).toBe('privet')
      expect(fileSlug('Иванов')).toBe('ivanov')
      expect(fileSlug('Тест/Файл')).toBe('test_fajl') // Й → j in slugify
    })

    it('should handle special characters', () => {
      expect(fileSlug('Test & Company')).toBe('test_and_company')
      expect(fileSlug('100% Pure')).toBe('100percent_pure') // % is converted to "percent"
      expect(fileSlug('$100')).toBe('dollar100') // $ is converted to "dollar"
      expect(fileSlug('#hashtag')).toBe('#hashtag') // # preserved
      expect(fileSlug('@username')).toBe('@username') // @ preserved
    })

    it('should handle numbers', () => {
      expect(fileSlug('123')).toBe('123')
      expect(fileSlug('Model 2024')).toBe('model_2024')
      expect(fileSlug('v1.2.3')).toBe('v123')
    })

    it('should handle unicode characters', () => {
      expect(fileSlug('café')).toBe('cafe')
      expect(fileSlug('naïve')).toBe('naive')
      expect(fileSlug('Zürich')).toBe('zurich')
      expect(fileSlug('São Paulo')).toBe('sao_paulo')
    })

    it('should handle parentheses and brackets', () => {
      expect(fileSlug('Test (v2)')).toBe('test_(v2)') // parentheses preserved by default
      expect(fileSlug('[Draft]')).toBe('[draft]') // brackets preserved
      expect(fileSlug('{config}')).toBe('{config}') // braces preserved
    })

    it('should handle empty and whitespace-only strings', () => {
      expect(fileSlug('')).toBe('')
      expect(fileSlug('   ')).toBe('')
    })

    it('should handle consecutive special characters', () => {
      expect(fileSlug('test///file')).toBe('test_file')
      expect(fileSlug('test___file')).toBe('test_file')
      expect(fileSlug('a..b..c')).toBe('abc')
    })

    it('should handle mixed special characters', () => {
      expect(fileSlug('Test/Path\\File')).toBe('test_path\\file') // backslash not replaced by default
      expect(fileSlug('Name<>:"|?*')).toBe('namelessgreater:or?*') // < becomes "less", > becomes "greater", | becomes "or"
      expect(fileSlug('File!@#$%^&*()')).toBe('file!@#dollarpercent^and*()') // $ becomes "dollar", % becomes "percent"
    })

    it('should handle edge cases', () => {
      expect(fileSlug('---')).toBe('---')
      expect(fileSlug('___')).toBe('')
      expect(fileSlug('...')).toBe('')
      expect(fileSlug('a-b_c')).toBe('a-b_c')
    })

    it('should not URL-encode the result', () => {
      const result = fileSlug('Test/File')
      expect(result).toBe('test_file')
      expect(result).not.toContain('%')
    })
  })

  describe('getBrandFileSlug', () => {
    it('should create file-safe slug from lastName only', () => {
      expect(getBrandFileSlug('Smith')).toBe('smith')
    })

    it('should create file-safe slug with firstName and lastName', () => {
      expect(getBrandFileSlug('Smith', 'John')).toBe('john_smith')
    })

    it('should handle slashes in brand names', () => {
      expect(getBrandFileSlug('Brauckmann/Lessing', 'm')).toBe('m_brauckmann_lessing')
      expect(getBrandFileSlug('Parent/Child Co.', 'A')).toBe('a_parent_child_co')
    })

    it('should handle special characters', () => {
      expect(getBrandFileSlug("O'Connor", 'Mary')).toBe('mary_oconnor')
      expect(getBrandFileSlug('Smith & Co.', 'J.R.')).toBe('jr_smith_and_co')
    })

    it('should handle null, undefined, and empty firstName', () => {
      expect(getBrandFileSlug('Johnson', null)).toBe('johnson')
      expect(getBrandFileSlug('Brown', undefined)).toBe('brown')
      expect(getBrandFileSlug('Wilson', '')).toBe('wilson')
    })

    it('should not contain URL-encoded characters', () => {
      const result = getBrandFileSlug('Test/Brand', 'm')
      expect(result).not.toContain('%2F')
      expect(result).not.toContain('%')
    })

    it('should handle complex brand names', () => {
      expect(getBrandFileSlug('Van Der Berg & Sons', 'Willem')).toBe('willem_van_der_berg_and_sons')
      expect(getBrandFileSlug('Société Française', 'La')).toBe('la_societe_francaise')
    })
  })

  describe('slug vs fileSlug comparison', () => {
    it('slug should URL-encode, fileSlug should not', () => {
      const text = 'Test/File'
      const fileResult = fileSlug(text)
      const urlResult = slug(text)

      expect(fileResult).toBe('test_file')
      expect(urlResult).toBe('test_file') // after our changes, both should be same since slugify handles it
    })

    it('should handle problematic characters differently', () => {
      const text = 'Brauckmann/Lessing'
      const fileResult = fileSlug(text)
      const urlResult = slug(text)

      // File slug should not have %2F
      expect(fileResult).toBe('brauckmann_lessing')
      expect(fileResult).not.toContain('%')

      // URL slug can use encodeURIComponent, but since we already handle /, it's same
      expect(urlResult).not.toContain('%2F')
    })
  })

  describe('real-world brand examples', () => {
    const brands = [
      { name: 'Brauckmann/Lessing', initial: 'm', expected: 'm_brauckmann_lessing' },
      { name: 'Smith & Sons', initial: 'J', expected: 'j_smith_and_sons' },
      { name: "O'Reilly Media", initial: null, expected: 'oreilly_media' },
      { name: 'AT&T', initial: null, expected: 'atandt' },
      { name: '3M Company', initial: null, expected: '3m_company' },
      { name: 'Société Générale', initial: null, expected: 'societe_generale' },
      { name: 'Rolls-Royce', initial: null, expected: 'rolls-royce' },
      { name: 'BASF SE', initial: null, expected: 'basf_se' },
    ]

    brands.forEach(({ name, initial, expected }) => {
      it(`should handle "${name}"${initial ? ` with initial "${initial}"` : ''}`, () => {
        const result = getBrandFileSlug(name, initial)
        expect(result).toBe(expected)
        expect(result).not.toContain('/')
        expect(result).not.toContain('%')
      })
    })
  })

  describe('filename safety edge cases', () => {
    it('should handle Windows forbidden characters', () => {
      // Windows doesn't allow: < > : " / \ | ? *
      // Note: slugify converts some to words, not all are sanitized
      expect(fileSlug('file<name')).toBe('filelessname') // < becomes "less"
      expect(fileSlug('file>name')).toBe('filegreatername') // > becomes "greater"
      expect(fileSlug('file:name')).toBe('file:name') // : preserved
      expect(fileSlug('file"name')).toBe('filename') // " removed by our remove option
      expect(fileSlug('file\\name')).toBe('file\\name') // \ preserved (not replaced)
      expect(fileSlug('file|name')).toBe('fileorname') // | becomes "or"
      expect(fileSlug('file?name')).toBe('file?name') // ? preserved
      expect(fileSlug('file*name')).toBe('file*name') // * preserved
    })

    it('should handle dot edge cases', () => {
      expect(fileSlug('.hidden')).toBe('hidden')
      expect(fileSlug('..parent')).toBe('parent')
      expect(fileSlug('file.name.ext')).toBe('filenameext')
    })

    it('should handle very long names', () => {
      const longName = 'a'.repeat(300)
      const result = fileSlug(longName)
      expect(result).toBe(longName) // slugify doesn't limit length by default
    })

    it('should handle emoji and special unicode', () => {
      expect(fileSlug('Test 😀 Emoji')).toBe('test_😀_emoji') // emoji preserved
      expect(fileSlug('Star ⭐ Icon')).toBe('star_⭐_icon') // emoji preserved
      expect(fileSlug('Arrow → Here')).toBe('arrow_→_here') // arrow preserved
    })

    it('should handle mixed language scripts', () => {
      expect(fileSlug('Hello Мир 世界')).toBe('hello_mir_世界') // Chinese not transliterated
      expect(fileSlug('Café日本')).toBe('cafe日本') // Japanese not transliterated
    })
  })
})
