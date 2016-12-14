//
//  ImageScrollView.swift
//  FastCart
//
//  Created by Luis Perez on 12/5/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import MisterFusion

public protocol ImageScrollViewDataSource: class {
    //func imageForIndex(index:Int) -> UIImage
    func imageURL(index:Int) -> URL
    func numberOfImages() -> Int
}

open class ImageScrollView: UIView, UIScrollViewDelegate {
    
    open let scrollView = UIScrollView()
    open let pageControl = UIPageControl()
    open var placeholderImage: UIImage?
    
    open weak var datasource: ImageScrollViewDataSource!
    
    open var initialPage: Int = 0
    open var showPageControl: Bool = true
    
    open func show() {
        setup()
    }
    
    func setup() {
        // Don't clip to bounds. 
        self.clipsToBounds = false
        self.scrollView.clipsToBounds = false

        // add scrollview
        self.scrollView.translatesAutoresizingMaskIntoConstraints = false
        self.scrollView.isPagingEnabled = true
        self.scrollView.showsHorizontalScrollIndicator = false
        self.scrollView.showsVerticalScrollIndicator = false
        self.scrollView.bounces = false
        self.scrollView.delegate = self
        self.addSubview(self.scrollView)
        self.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "H:|[view]|", options: [], metrics: nil, views: ["view":self.scrollView]))
        self.addConstraints(NSLayoutConstraint.constraints(withVisualFormat: "V:|[view]|", options: [], metrics: nil, views: ["view":self.scrollView]))
        
        // add page control only if more than one image!
        if self.datasource.numberOfImages() > 1 && self.showPageControl {
            self.pageControl.translatesAutoresizingMaskIntoConstraints = false
            self.pageControl.currentPageIndicatorTintColor = UIColor.darkGray
            self.pageControl.pageIndicatorTintColor = UIColor.lightGray
            self.addLayoutSubview(self.pageControl, andConstraints:
                pageControl.centerX |==| scrollView.centerX,
                pageControl.height |==| Constants.kBannerHeight,
                pageControl.bottom |==| self.bottom |+| 24
            )
        }
        
        // add photos
        reloadPhotos()
    }
    
    open func reloadPhotos() {
        // remove old ImageViews (if any)
        for view in self.scrollView.subviews {
            view.removeFromSuperview()
        }
        
        // add photos to scrollView
        for index in 0..<self.datasource.numberOfImages() {
            let imageView = UIImageView()
            imageView.tag = index+1
            imageView.contentMode = .scaleAspectFill
            imageView.clipsToBounds = true
            imageView.translatesAutoresizingMaskIntoConstraints = false
            Utilities.updateImageView(imageView, withAsset: URLRequest(url: self.datasource.imageURL(index: index)), withPreview: nil, withPlaceholder: self.placeholderImage)
            self.scrollView.addSubview(imageView)
            
            // add constraints
            // height
            self.scrollView.addLayoutSubview(imageView, andConstraints:
                imageView.height,
                imageView.width,
                imageView.top,
                imageView.bottom
            )
            if index == 0 {
                // left to scrollview
                self.scrollView.addConstraint(NSLayoutConstraint(item: self.scrollView, attribute: .left, relatedBy: .equal, toItem: imageView, attribute: .left, multiplier: 1, constant: 0))
            }
            if index > 0 {
                // left to right of previous view
                let previouseImageView = self.viewWithTag(index)!
                self.scrollView.addConstraint(NSLayoutConstraint(item: previouseImageView, attribute: .right, relatedBy: .equal, toItem: imageView, attribute: .left, multiplier: 1, constant: 0))
            }
            if index == self.datasource.numberOfImages() - 1 {
                // right to scrollview
                self.scrollView.addConstraint(NSLayoutConstraint(item: self.scrollView, attribute: .right, relatedBy: .equal, toItem: imageView, attribute: .right, multiplier: 1, constant: 0))
            }
        }
        
        // update page control
        self.pageControl.numberOfPages = self.datasource.numberOfImages()
        self.pageControl.currentPage = self.initialPage
    }
    
    open func scrollViewDidEndDecelerating(_ scrollView: UIScrollView) {
        // update pageController
        let pageWidth = scrollView.frame.size.width
        let fractionalPage = Float(scrollView.contentOffset.x / pageWidth)
        let page = Int(roundf(fractionalPage))
        self.pageControl.currentPage = page
    }
}



