//
//  OnboardingPageViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/12/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import MisterFusion

class OnboardingPageViewController: UIPageViewController, UIPageViewControllerDataSource {
    
    var arrPageTitle = [String]()
    var arrPagePhoto = [UIImage]()
    
    private var pageControl = UIPageControl()
    
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        arrPageTitle = ["Welcome Fastcart", "Scan Products", "Make Price Comparisons"]
        arrPagePhoto = [#imageLiteral(resourceName: "Details page"), #imageLiteral(resourceName: "Details page"), #imageLiteral(resourceName: "Details page")]
       
        
        self.dataSource = self
        self.setViewControllers([getViewControllerAtIndex(index: 0)] as [UIViewController], direction: UIPageViewControllerNavigationDirection.forward, animated: false, completion: nil)
        
        self.pageControl.translatesAutoresizingMaskIntoConstraints = false
        self.pageControl.currentPageIndicatorTintColor = UIColor.darkGray
        self.pageControl.pageIndicatorTintColor = UIColor.lightGray
        self.view.addLayoutSubview(self.pageControl, andConstraints:
            pageControl.centerX |==| view.centerX,
            pageControl.bottom |==| view.bottom |+| 10
        )
        
    }
    
    func pageViewController(_ pageViewController: UIPageViewController, viewControllerBefore viewController: UIViewController) -> UIViewController?
    {
        let pageContent: PageContentViewController = viewController as! PageContentViewController
        var index = pageContent.pageIndex
        if ((index == 0) || (index == NSNotFound))
        {
            return nil
        }
        index = index - 1
        return getViewControllerAtIndex(index: index)
    }

    func pageViewController(_ pageViewController: UIPageViewController, viewControllerAfter viewController: UIViewController) -> UIViewController?
    {
        let pageContent: PageContentViewController = viewController as! PageContentViewController
        var index = pageContent.pageIndex
        if (index == NSNotFound)
        {
            return nil;
        }
        
        index = index + 1
        if (index == arrPageTitle.count)
        {
            return nil;
        }
        return getViewControllerAtIndex(index: index)
    }
    
    func getViewControllerAtIndex(index: Int) -> PageContentViewController
    {
        // Create a new view controller and pass suitable data.
        let pageContentViewController = self.storyboard?.instantiateViewController(withIdentifier: "PageContentViewController") as! PageContentViewController
        pageContentViewController.labelTitle = "\(arrPageTitle[index])"
        pageContentViewController.photo = arrPagePhoto[index]
        pageContentViewController.pageIndex = index
        return pageContentViewController
    }

}
