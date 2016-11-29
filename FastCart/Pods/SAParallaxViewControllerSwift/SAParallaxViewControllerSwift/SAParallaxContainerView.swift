//
//  SAParallaxContainerView.swift
//  SAParallaxViewControllerSwift
//
//  Created by 鈴木大貴 on 2015/02/01.
//  Copyright (c) 2015年 鈴木大貴. All rights reserved.
//

import UIKit
import SABlurImageView

open class SAParallaxContainerView: UIView {
    
    open var imageView = UIImageView()
    open var accessoryView = UIView()
    
    open var blurContainerView = UIView()
    open var blurImageView = SABlurImageView()
    
    fileprivate var yStartPoint: CGFloat?
    fileprivate var accessoryViewHeight: CGFloat = 60
    
    fileprivate var blurColorView = UIView()
    fileprivate var blurSize: CGFloat = 0
    
    public convenience init() {
        self.init(frame: .zero)
        initialize()
    }
    
    public override init(frame: CGRect) {
        super.init(frame: frame)
        initialize()
    }
    
    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initialize()
    }
    
    //MARK: - SAParallaxContainerView Private Methods
    fileprivate func initialize() {
        imageView.contentMode = .scaleAspectFit
        
        accessoryView.backgroundColor = .clear
        
        backgroundColor = .clear
        clipsToBounds = true
    }
    
    //MARK: - SAParallaxContainerView Public Methods
    open func setImage(_ image: UIImage) {
        self.imageView.image = image
        if let imageSize = imageView.image?.size {
            let width = bounds.size.width
            let height = width * imageSize.height / imageSize.width
            
            let yPoint = yStartPoint ?? 0
            if yPoint == 0 {
                yStartPoint = 0
            }
            imageView.autoresizingMask = UIViewAutoresizing()
            imageView.frame = CGRect(x: 0, y: -yPoint, width: width, height: height)
            addSubview(imageView)
        }
    }
    
    open func setImageOffset(_ offset: CGPoint) {
        imageView.frame = imageView.bounds.offsetBy(dx: offset.x, dy: offset.y)
    }
    
    open func setParallaxStartPosition(_ y: CGFloat) {
        yStartPoint = CGFloat(y)
    }
    
    open func parallaxStartPosition() -> CGFloat? {
        return yStartPoint
    }
    
    open func setAccessoryViewHeight(_ height: CGFloat) {
        accessoryViewHeight = CGFloat(height)
    }
    
    open func setBlurSize(_ size: CGFloat) {
        blurSize = size
    }
    
    open func setBlurColorAlpha(_ alpha: CGFloat) {
        blurColorView.alpha = alpha
    }
    
    open func setBlurColor(_ color: UIColor) {
        blurColorView.backgroundColor = color
    }
}
