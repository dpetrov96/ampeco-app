import UIKit
import React

@objc(ClusterBadgeModule)
class ClusterBadgeModule: NSObject {
  private static let countCache = NSCache<NSNumber, NSString>()
  private static let pinCache = NSCache<NSString, NSString>()

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  /// Sync so Marker can use the URI during render (cached after first draw).
  @objc(getBadgeUri:)
  func getBadgeUri(_ count: NSNumber) -> String {
    if let cached = Self.countCache.object(forKey: count) {
      return cached as String
    }
    let value = max(2, count.intValue)
    let uri = Self.renderClusterDataUri(count: value)
    Self.countCache.setObject(uri as NSString, forKey: NSNumber(value: value))
    return uri
  }

  @objc(getPinUri:)
  func getPinUri(_ label: NSString) -> String {
    let key = label as String
    if let cached = Self.pinCache.object(forKey: key as NSString) {
      return cached as String
    }
    let uri = Self.renderPinDataUri(label: key)
    Self.pinCache.setObject(uri as NSString, forKey: key as NSString)
    return uri
  }

  private static func formatCount(_ count: Int) -> String {
    if count >= 1000 {
      let tenths = Int((Double(count) / 100.0).rounded())
      let n = Double(tenths) / 10.0
      if n == Double(Int(n)) {
        return "\(Int(n))k"
      }
      return String(format: "%.1fk", n)
    }
    return "\(count)"
  }

  private static func renderClusterDataUri(count: Int) -> String {
    let label = formatCount(count)
    let pointSize: CGFloat
    if count >= 1000 {
      pointSize = 52
    } else if count >= 100 {
      pointSize = 48
    } else if count >= 10 {
      pointSize = 40
    } else {
      pointSize = 36
    }

    let format = UIGraphicsImageRendererFormat.default()
    format.opaque = false
    format.scale = UIScreen.main.scale

    let renderer = UIGraphicsImageRenderer(
      size: CGSize(width: pointSize, height: pointSize),
      format: format
    )

    let image = renderer.image { _ in
      let bounds = CGRect(x: 0, y: 0, width: pointSize, height: pointSize)

      UIColor(red: 14 / 255, green: 96 / 255, blue: 195 / 255, alpha: 0.28).setFill()
      UIBezierPath(ovalIn: bounds).fill()

      UIColor(white: 0.07, alpha: 1).setFill()
      UIBezierPath(ovalIn: bounds.insetBy(dx: 3, dy: 3)).fill()

      UIColor(red: 14 / 255, green: 96 / 255, blue: 195 / 255, alpha: 1).setFill()
      UIBezierPath(ovalIn: bounds.insetBy(dx: 5.5, dy: 5.5)).fill()

      let fontSize: CGFloat
      if count >= 1000 {
        fontSize = 14
      } else if count >= 100 {
        fontSize = 15
      } else if count >= 10 {
        fontSize = 16
      } else {
        fontSize = 17
      }

      let paragraph = NSMutableParagraphStyle()
      paragraph.alignment = .center

      let attrs: [NSAttributedString.Key: Any] = [
        .font: UIFont.systemFont(ofSize: fontSize, weight: .bold),
        .foregroundColor: UIColor.white,
        .paragraphStyle: paragraph,
      ]

      let textSize = (label as NSString).size(withAttributes: attrs)
      let textRect = CGRect(
        x: (pointSize - textSize.width) / 2,
        y: (pointSize - textSize.height) / 2 - 0.5,
        width: textSize.width,
        height: textSize.height
      )
      (label as NSString).draw(in: textRect, withAttributes: attrs)
    }

    return pngDataUri(image)
  }

  private static func renderPinDataUri(label: String) -> String {
    guard let body = UIImage(named: "pin-body") else {
      return ""
    }

    // Keep in sync with src/features/map/pinIconLayout.ts
    let width: CGFloat = 56
    let pinHeight = width * (370.0 / 300.0)
    let labelGap: CGFloat = 3
    let labelBoxHeight: CGFloat = 15
    let totalHeight = pinHeight + labelGap + labelBoxHeight
    let fontSize: CGFloat = 9

    let format = UIGraphicsImageRendererFormat.default()
    format.opaque = false
    format.scale = UIScreen.main.scale

    let renderer = UIGraphicsImageRenderer(
      size: CGSize(width: width, height: totalHeight),
      format: format
    )

    let image = renderer.image { _ in
      body.draw(in: CGRect(x: 0, y: 0, width: width, height: pinHeight))

      let paragraph = NSMutableParagraphStyle()
      paragraph.alignment = .center

      let attrs: [NSAttributedString.Key: Any] = [
        .font: UIFont.systemFont(ofSize: fontSize, weight: .semibold),
        .foregroundColor: UIColor.white,
        .paragraphStyle: paragraph,
      ]

      let text = label as NSString
      let textSize = text.size(withAttributes: attrs)
      let boxWidth = min(width - 4, max(textSize.width + 10, 22))
      let boxRect = CGRect(
        x: (width - boxWidth) / 2,
        y: pinHeight + labelGap,
        width: boxWidth,
        height: labelBoxHeight
      )

      UIColor(white: 0, alpha: 0.18).setFill()
      UIBezierPath(roundedRect: boxRect.insetBy(dx: -2, dy: -1.5), cornerRadius: 5).fill()

      UIColor(white: 0.07, alpha: 0.92).setFill()
      UIBezierPath(roundedRect: boxRect, cornerRadius: 4).fill()

      let textRect = CGRect(
        x: boxRect.minX,
        y: boxRect.midY - textSize.height / 2,
        width: boxRect.width,
        height: textSize.height
      )
      text.draw(in: textRect, withAttributes: attrs)
    }

    return pngDataUri(image)
  }

  private static func pngDataUri(_ image: UIImage) -> String {
    guard let data = image.pngData() else {
      return ""
    }
    return "data:image/png;base64,\(data.base64EncodedString())"
  }
}
