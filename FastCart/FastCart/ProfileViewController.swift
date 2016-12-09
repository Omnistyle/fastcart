//
//  ProfileViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import FBSDKLoginKit
import MXParallaxHeader

class ProfileViewController: UIViewController, FBSDKLoginButtonDelegate, UITableViewDelegate, UITableViewDataSource  {
    
    var scrollView: MXScrollView!
    
    @IBOutlet weak var tableView: UITableView!
//    var table1: UITableView!
    let titles = [["Current order"],
                  ["Contact us", "Rate the app", "Invite friends"],
                  ["Account"]]
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Do any additional setup after loading the view.
        // Parallax Header
        scrollView = MXScrollView()
        let header = Bundle.main.loadNibNamed("StarshipHeader", owner: self, options: nil)?.first as? CustomHeader

        header?.backgroundImageUrl = URL(string: "http://www.designbolts.com/wp-content/uploads/2013/02/Noise-Light-Grey-Tileable-Pattern-For-Website-Background.jpg")
        
        if let user = User.currentUser {
            if let strg = user.facebookProfilePictureUrlString {
            
                header?.foregroundImageUrl = URL(string: strg)
                print(strg)
            }
            if let username = user.username {
                header?.name = username
                print(username)
            }
        }
     
        
//        if ((User.currentUser?.facebookProfilePictureUrlString = User.currentUser?.facebookProfilePictureUrlString) != nil) {
//            
//            if let gotUserProfileUrlPic = User.currentUser?.facebookProfilePictureUrlString {
//                header?.foregroundImageUrl = URL(string: "http://graph.facebook.com/10157675891475375/picture?type=large")
//                
//                print(gotUserProfileUrlPic)
//            }
//            
//            
//        }
        
//        header?.foregroundImageUrl = URL(string: "https://pbs.twimg.com/profile_images/575763771932573696/4UoYccGP.jpeg")
        scrollView.parallaxHeader.view = header// You can set the parallax header view from a nib.
        scrollView.parallaxHeader.height = 250
        scrollView.parallaxHeader.mode = MXParallaxHeaderMode.fill
        scrollView.parallaxHeader.minimumHeight = 20
        view.addSubview(scrollView)
        
//        table1 = UITableView()
        
        // tableview 
        
        tableView.dataSource = self;
        tableView.delegate = self
        tableView.backgroundColor = UIColor.white
        scrollView.addSubview(tableView)
        // hide first section header
        tableView.contentInset = UIEdgeInsetsMake(-1.0, 0.0, 0.0, 0.0);
        // get rid of empty cells
        
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        var frame = view.frame
        
        scrollView.frame = frame
        scrollView.contentSize = frame.size
        
        frame.size.height = tableView.contentSize.height
        tableView.frame = frame
        
    }
    
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        // set height to 1 for the first section header
        if (section == 0) {
            return 1.0
        }
        return 40
    }
    func tableView(_ tableView: UITableView, heightForFooterInSection section: Int) -> CGFloat {
        return 0.00001
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        print(section)
        print("get here")
        let headerView = UIView.init(frame: CGRect(x: 0, y: 0, width: tableView.bounds.size.width, height: 50))
        let lblHeader = UILabel.init(frame: CGRect(x: 15, y: 13, width: tableView.bounds.size.width - 10, height: 24))
        if section == 1 {
            lblHeader.text = "About Shoply"
        }
        lblHeader.font = UIFont (name: "Helvetica", size: 14)
        lblHeader.textColor = UIColor(colorLiteralRed: 179.0/255.0, green: 179.0/255.0, blue: 179.0/255.0, alpha: 1.0)

        headerView.addSubview(lblHeader)
        headerView.backgroundColor = UIColor(colorLiteralRed: 248.0/255.0, green: 248.0/255.0, blue: 248.0/255.0, alpha: 1.0)
        return headerView
    }
    
    func numberOfSections(in tableView: UITableView) -> Int {
        return 3
    }
    
    // table functions
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return titles[section].count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "OptionCell") as! OptionCell
        
        cell.optionLabel.text = titles[indexPath.section][indexPath.row]
        // Add logout button.
        if indexPath.section == 2 {
            let loginButton = FBSDKLoginButton()
            
            loginButton.frame = CGRect(x: 0, y: 0, width: tableView.bounds.width, height: cell.contentView.frame.height)
            loginButton.delegate = self
            
            cell.contentView.addSubview(loginButton)
        }

        cell.backgroundColor = UIColor.white
        
        // separator insets
        cell.preservesSuperviewLayoutMargins = false
        cell.separatorInset = UIEdgeInsets.zero
        cell.layoutMargins = UIEdgeInsets.zero
        
        return cell
    }
    
    // scroll view delegate
//    func scrollViewDidScroll(_ scrollView: UIScrollView) {
//        print("progress %f", scrollView.parallaxHeader.progress)
//    }
    
    //

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        // handle transition
        if indexPath.section == 0 {
            self.tabBarController?.switchToList(at: 1)
            self.tabBarController?.selectedIndex = 2
        } else {
            // contact
            if indexPath.row == 0 {
                if let url = URL(string: "https://fastcart.herokuapp.com/") {
                    UIApplication.shared.open(url, options: [:], completionHandler: nil)
                }
            }
            // rate app
            else if indexPath.row == 1 {
                self.rateApp()
            }
            // share
            else {
                self.shareApp(self, message: "Hi, checkout this awesome app!")
            }
        }
    }
    
    // relevant functions
    func shareApp(_ view: UIViewController, message: String) {
        var objectsToShare = [Any]()
        let appId = "1182855639"
        if let myWebsite = URL(string: "itms://itunes.apple.com/us/app/apple-store/\(appId)?mt=8") {
            objectsToShare = [message, myWebsite]
        }
        else {
            objectsToShare = [message]
        }
        let activityVC = UIActivityViewController(activityItems: objectsToShare, applicationActivities: nil)
        //New Excluded Activities Code
        activityVC.excludedActivityTypes = [UIActivityType.airDrop, UIActivityType.addToReadingList]
        view.present(activityVC, animated: true, completion: nil)
    }
    
    func rateApp() {
        // TODO test this
        let appId = "1182855639"
        let url_string = "itms-apps://itunes.apple.com/app/id\(appId)"
        if let url = URL(string: url_string) {
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
        }
    }
    
    func loginButtonDidLogOut(_ loginButton: FBSDKLoginButton!) {
        NotificationCenter.default.post(name: User.userDidLogoutNotification, object: self)
    }

    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error!) {
        if error != nil {
            print(error)
            return
        }
        
        FBSDKGraphRequest(graphPath: "/me", parameters: ["fields" : "id, name, email"]).start { (connecion, result, error) in
            if error != nil {
                print("failed to start graph")
                print(error?.localizedDescription ?? "undefined error")
                return
            }
        }
        
    }
    

}
