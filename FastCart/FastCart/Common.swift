//
//  Common.swift
//  FastCart
//
//  Created by Luis Perez on 11/25/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import EVReflection
import UIKit.UIGestureRecognizerSubclass

/**
 Contains commonly used keys for storing data locally.
 */
public enum Persistece: String {
    case receipt = "currentReceipt"
    case user = "currentUser"
    
    static let allValues = [receipt, user]
}

public class Constants {
    static let themeColor = UIColor(red: 114.0/255, green: 190.0/255, blue: 183.0/255, alpha: 1)
}

extension URL {
    func toJson() -> String {
        return self.absoluteString
    }
    static func fromJson(json: String?) -> URL? {
        if let url = json {
            return URL(string: url)
        }
        return nil
    }
}

extension UITabBarController {
    func switchToList(at index: Int) {
        let nvc = self.viewControllers![2] as! UINavigationController
        let tvc = nvc.viewControllers[0] as! TabViewController
        // Force load it, just in case.
        let _ = tvc.view
        
        tvc.selectedIndex = index
    }
}

/**
 The direction the recognizer detects. Note that the direction is defined according to the 
 velocity of the initial swipe.
 */
enum PanDirection {
    case vertical
    case horizontal
}

class PanDirectionGestureRecognizer: UIPanGestureRecognizer {
    
    private let direction : PanDirection
    
    /**
     Initialize a custom UIPanGestureRecognizer that only recognizers horizontal or vertical directions.
     
     - parameters:
        - direction: The PanDirection to recognize.
     */
    init(direction: PanDirection, target: AnyObject, action: Selector) {
        self.direction = direction
        super.init(target: target, action: action)
    }
    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
        super.touchesMoved(touches, with: event)
        if state == .began {
            let v = velocity(in: self.view!)
            switch direction {
            case .horizontal where fabs(v.y) > fabs(v.x):
                state = .cancelled
            case .vertical where fabs(v.x) > fabs(v.y):
                state = .cancelled
            default:
                break
            }
        }
    }
}
