import {beforeEach, describe, expect, it, vi} from 'vitest'

import {addSvgComment, downloadDataUrl, getProcessedSvgString, svgToDataUrl} from '../imageUtils'

// Mock DOM methods
const mockCreateComment = vi.fn()
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()

// Mock global objects
Object.defineProperty(document, 'createComment', {
  value: mockCreateComment,
  writable: true,
})

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
})

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true,
})

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true,
})

describe('imageUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addSvgComment', () => {
    it('should add a comment to SVG element', () => {
      const mockSvg = {
        firstChild: null,
        insertBefore: vi.fn(),
      } as any

      const mockComment = {nodeType: 8}
      mockCreateComment.mockReturnValue(mockComment)

      addSvgComment(mockSvg, 'Test Peep')

      expect(mockCreateComment).toHaveBeenCalledWith(
        'Test Peep from Peeps Club! Created with ❤️ by Ao Collaboration',
      )
      expect(mockSvg.insertBefore).toHaveBeenCalledWith(mockComment, null)
    })

    it('should add a comment without name', () => {
      const mockSvg = {
        firstChild: null,
        insertBefore: vi.fn(),
      } as any

      const mockComment = {nodeType: 8}
      mockCreateComment.mockReturnValue(mockComment)

      addSvgComment(mockSvg)

      expect(mockCreateComment).toHaveBeenCalledWith(
        'Peeps Club! Created with ❤️ by Ao Collaboration',
      )
      expect(mockSvg.insertBefore).toHaveBeenCalledWith(mockComment, null)
    })
  })

  describe('svgToDataUrl', () => {
    it('should convert SVG to data URL', () => {
      const mockSvg = {
        cloneNode: vi.fn().mockReturnThis(),
      } as any

      // Mock XMLSerializer
      const mockSerializeToString = vi.fn().mockReturnValue('<svg></svg>')
      const mockXMLSerializer = vi.fn().mockImplementation(() => ({
        serializeToString: mockSerializeToString,
      }))
      Object.defineProperty(window, 'XMLSerializer', {
        value: mockXMLSerializer,
        writable: true,
      })

      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
      Object.defineProperty(window.URL, 'createObjectURL', {
        value: mockCreateObjectURL,
        writable: true,
      })

      const result = svgToDataUrl(mockSvg)

      expect(mockSerializeToString).toHaveBeenCalledWith(mockSvg)
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(result).toBe('blob:test-url')
    })
  })

  describe('downloadDataUrl', () => {
    it('should create and click download link', () => {
      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      }
      mockCreateElement.mockReturnValue(mockLink)

      downloadDataUrl('data:image/png;base64,test', 'test.png')

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe('data:image/png;base64,test')
      expect(mockLink.download).toBe('test.png')
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink)
      expect(mockClick).toHaveBeenCalled()
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink)
    })
  })

  describe('getProcessedSvgString', () => {
    it('should process SVG and return serialized string', async () => {
      const mockSvg = {
        cloneNode: vi.fn().mockReturnValue({
          querySelectorAll: vi.fn().mockReturnValue([]),
          firstChild: null,
          insertBefore: vi.fn(),
        }),
      } as any

      const svgContent: {[key: string]: string} = {}
      const loadSvg = vi.fn().mockResolvedValue(undefined)

      // Mock XMLSerializer
      const mockSerializeToString = vi.fn().mockReturnValue('<svg>processed</svg>')
      const mockXMLSerializer = vi.fn().mockImplementation(() => ({
        serializeToString: mockSerializeToString,
      }))
      Object.defineProperty(window, 'XMLSerializer', {
        value: mockXMLSerializer,
        writable: true,
      })

      const result = await getProcessedSvgString(mockSvg, svgContent, loadSvg, 'Test Peep')

      expect(mockSvg.cloneNode).toHaveBeenCalledWith(true)
      expect(mockSerializeToString).toHaveBeenCalled()
      expect(result).toBe('<svg>processed</svg>')
    })

    it('should process SVG without name', async () => {
      const mockSvg = {
        cloneNode: vi.fn().mockReturnValue({
          querySelectorAll: vi.fn().mockReturnValue([]),
          firstChild: null,
          insertBefore: vi.fn(),
        }),
      } as any

      const svgContent: {[key: string]: string} = {}
      const loadSvg = vi.fn().mockResolvedValue(undefined)

      // Mock XMLSerializer
      const mockSerializeToString = vi.fn().mockReturnValue('<svg>processed</svg>')
      const mockXMLSerializer = vi.fn().mockImplementation(() => ({
        serializeToString: mockSerializeToString,
      }))
      Object.defineProperty(window, 'XMLSerializer', {
        value: mockXMLSerializer,
        writable: true,
      })

      const result = await getProcessedSvgString(mockSvg, svgContent, loadSvg)

      expect(mockSvg.cloneNode).toHaveBeenCalledWith(true)
      expect(mockSerializeToString).toHaveBeenCalled()
      expect(result).toBe('<svg>processed</svg>')
    })
  })
})
