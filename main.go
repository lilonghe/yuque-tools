package main

import (
	"bufio"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	root := flag.String("path", "./", "yuque export markdown files directory")
	flag.Parse()

	err := filepath.Walk(*root, walkfunc)
	if err != nil {
		panic(err)
	}
	fmt.Println("----------------EOF-------------------")
}

func walkfunc(path string, info os.FileInfo, err error) error {
	if info != nil && !info.IsDir() && strings.HasSuffix(info.Name(), "md") {
		fmt.Println("find ->", info.Name())
		err := turnMD(path)
		if err != nil {
			return err
		}
		fmt.Println("end ->", info.Name())
	}

	return nil
}

func turnMD(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	allText := ""
	scanner := bufio.NewScanner(file)

	codeBlock := false
	for scanner.Scan() {
		lineText := scanner.Text()
		addSpace := true

		// 空内容
		if len(lineText) > 0 {
			if strings.HasPrefix(lineText, "```") {
				if codeBlock {
					codeBlock = false
					addSpace = false
				} else {
					codeBlock = true
				}
			}
			if codeBlock {
				addSpace = false
			}
			if strings.HasPrefix(lineText, "#") {
				addSpace = false
			}
			if strings.HasSuffix(lineText, "  ") {
				addSpace = false
			}

			allText += lineText
			if addSpace {
				allText += "  "
			}
			allText += "\n"
		} else {
			allText += "\n"
		}

	}

	err = scanner.Err()
	if err != nil {
		return err
	}

	err = ioutil.WriteFile(path+".new", []byte(allText), 0777)
	if err != nil {
		return err
	}

	return nil
}
