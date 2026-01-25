"use client"
import NextImage from "next/image"
import { ImageProps } from "next/image"
import { FC, useState, useEffect, useCallback } from "react"

export const Image: FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  ...props
}) => {
  return (
    <NextImage src={src} alt={alt} width={width} height={height} {...props} />
  )
}

Object.assign(Image, {
  Full: ({ src, alt, ...props }: ImageProps) => {
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    const handleResize = useCallback(() => {
      const { innerHeight, innerWidth } = window
      setWidth(innerWidth)
      setHeight(innerHeight)
    }, [])

    useEffect(() => {
      const controller = new AbortController()
      const { signal } = controller

      handleResize()
      window.addEventListener("resize", handleResize, { signal })

      return () => controller.abort()
    }, [handleResize])

    return (
      <Image src={src} alt={alt} width={width} height={height} {...props} />
    )
  },
  Natural: ({ src, alt, ...props }: ImageProps) => {
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    useEffect(() => {
      const controller = new AbortController()
      const { signal } = controller

      const image = new window.Image()
      image.src = src as string
      image.addEventListener("load", () => {
        setWidth(image.width)
        setHeight(image.height)
      }, { signal })
      image.addEventListener("error", () => {
        setWidth(0)
        setHeight(0)
      }, { signal })

      return () => controller.abort()
    }, [src])

    return (
      <Image src={src} alt={alt} width={width} height={height} {...props} />
    )
  }
})

export default Image