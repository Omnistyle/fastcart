//
//  RootViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/12/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import MisterFusion

class RootViewController:  UIViewController, UIPageViewControllerDataSource {
    
    var arrPageTitle = [String]()
    var arrPagePhoto = [UIImage]()
    var pageViewController: UIPageViewController!
    
    @IBOutlet weak var loginButton: UIButton!
    
    private var pageControl : UIPageControl = UIPageControl()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        arrPageTitle = ["Welcome to Fastcart", "Scan the products you love", "See reviews, price comparisons, more!"]
        arrPagePhoto = [#imageLiteral(resourceName: "firstWalkthrough"), #imageLiteral(resourceName: "secondWalkthrough"), #imageLiteral(resourceName: "thirdWalkthrough")]
        
        self.pageViewController = self.storyboard?.instantiateViewController(withIdentifier: "PageViewController") as! UIPageViewController
        self.pageViewController.view.frame = CGRect(x: CGFloat(0.0), y: CGFloat(0), width: self.view.frame.width, height: self.view.frame.size.height - loginButton.frame.size.height)
        self.pageViewController.dataSource = self
        self.pageViewController.setViewControllers([getViewControllerAtIndex(index: 0)] as [UIViewController], direction: UIPageViewControllerNavigationDirection.forward, animated: false, completion: nil)
        
        // get page view controller to show
        self.addChildViewController(self.pageViewController)
        self.view.addSubview(self.pageViewController.view)
        self.pageViewController.didMove(toParentViewController: self)
        
        // configure page control
        configurePageControl()
        
    }
    
    func configurePageControl() {
        // The total number of pages that are available is based on how many available colors we have.
    
        self.pageControl.translatesAutoresizingMaskIntoConstraints = false
        self.pageControl.currentPageIndicatorTintColor = UIColor.darkGray
        self.pageControl.pageIndicatorTintColor = UIColor.lightGray
        self.view.addLayoutSubview(self.pageControl, andConstraints:
            pageControl.centerX |==| view.centerX,
            pageControl.bottom |==| loginButton.top |+| 32,
            pageControl.width |==| 100,
            pageControl.height |==| 50
        )
        self.pageControl.numberOfPages = arrPagePhoto.count
        self.pageControl.currentPage = 0
        
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
    //
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
        
        // if it's the initial page, text should be larger
        
        pageContentViewController.pageIndex = index
        pageControl.currentPage = index
        return pageContentViewController
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}
