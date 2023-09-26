// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::process::{Command, Stdio};
use std::fs::{File, OpenOptions};
use std::io::{self, prelude::*};
use std::path::Path;

#[tauri::command(rename_all = "snake_case")]
fn add_line_to_hosts(hostname: String, password: String) {
    // Construct the line to add to /etc/hosts
    let line_to_add = format!("127.0.0.1 {}", hostname);
    let comment = format!("# Added by the Ophiuchi app for {}", hostname);

    // Check if the line already exists in /etc/hosts
    if !host_line_exists(&line_to_add) {
        // Append the new line to /etc/hosts with sudo
        append_to_hosts_with_sudo(&line_to_add, &password);

        // Add the comment above the line
        // add_comment_above_line(&line_to_add, &comment, &password);
    } else {
        println!("Line already exists in /etc/hosts: {}", line_to_add);
    }
}

// Check if the line already exists in /etc/hosts
fn host_line_exists(line: &str) -> bool {
    if let Ok(hosts) = read_hosts_file() {
        for host in hosts.lines() {
            if host.trim() == line.trim() {
                return true;
            }
        }
    }
    false
}

// Read the contents of /etc/hosts
fn read_hosts_file() -> io::Result<String> {
    let path = "/etc/hosts";
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}


// Append the line to /etc/hosts with sudo and provide the password
fn append_to_hosts_with_sudo(line: &str, password: &str) {
    // Create a command to execute sudo
    let mut command = Command::new("sudo");

    //echo '{}\n' | sudo tee -a /etc/hosts
    // Add arguments to the
    command
        .arg("-p")
        .arg("")
        .arg("-S")
        .arg("--")
        .arg("sh")
        .arg("-c")
        .arg(format!("echo '{}\n' | sudo tee -a /etc/hosts", line))
        .stdin(Stdio::piped()) // Open a pipe for standard input
        .stdout(Stdio::inherit()) // Inherit standard output
        .stderr(Stdio::inherit()); // Inherit standard error

    // Spawn the sudo command
    let mut child = command.spawn().expect("Failed to execute sudo command");

    // Write the password to sudo's standard input
    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(password.as_bytes()).expect("Failed to write password to sudo");
        // add line break
        stdin.write_all(b"\n").expect("Failed to write password to sudo");
    }

    // Wait for the child process to complete
    let status = child.wait().expect("Failed to wait for sudo command");

    if status.success() {
        println!("Line added to /etc/hosts: {}", line);
    } else {
        eprintln!("Error appending to /etc/hosts.");
    }
}



#[tauri::command(rename_all = "snake_case")]
fn add_cert_to_keychain(pem_file_path: String) {
    // Get the user's home directory
    if let Some(home_dir) = env::var_os("HOME") {
        if let Some(home_dir_str) = home_dir.to_str() {
            // Create the full path to the keychain file
            let keychain_path = format!("{}/Library/Keychains/login.keychain-db", home_dir_str);

            // Create a command to execute
            let mut command = Command::new("security");

            // Add arguments to the command
            command
                .arg("add-trusted-cert")
                // .arg("-d")
                .arg("-k")
                .arg(&keychain_path) // Use the resolved keychain path
                .arg(&pem_file_path); // Use the provided PEM file path

            // Execute the command
            let output = command.output().expect("Failed to execute command");

            // Check the command's exit status
            if output.status.success() {
                println!("Certificate added successfully.");
            } else {
                eprintln!("Error: {:?}", output);
            }
        } else {
            eprintln!("Failed to convert home directory to string.");
        }
    } else {
        eprintln!("Home directory not found.");
    }
}


#[tauri::command(rename_all = "snake_case")]
fn remove_cert_from_keychain(name: String) {
    // Get the user's home directory
    if let Some(home_dir) = env::var_os("HOME") {
        if let Some(home_dir_str) = home_dir.to_str() {
            // Create the full path to the keychain file
            let keychain_path = format!("{}/Library/Keychains/login.keychain-db", home_dir_str);

            // Create a command to execute
            let mut command = Command::new("security");

            // Add arguments to the command
            command
                .arg("delete-certificate")
                .arg("-c")
                .arg(name)
                .arg("-t")
                .arg(&keychain_path); // Use the resolved keychain path

            // Execute the command
            let output = command.output().expect("Failed to execute command");

            // Check the command's exit status
            if output.status.success() {
                println!("Certificate removed successfully.");
            } else {
                eprintln!("Error: {:?}", output);
            }
        } else {
            eprintln!("Failed to convert home directory to string.");
        }
    } else {
        eprintln!("Home directory not found.");
    }
}

fn main() {
  let _ = fix_path_env::fix();
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        add_cert_to_keychain, 
        remove_cert_from_keychain,
        add_line_to_hosts
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}


