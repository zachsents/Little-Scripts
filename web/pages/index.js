import { Badge, Button, Center, Group, Skeleton, Space, Stack, Text, Title } from "@mantine/core"
import HomeHeader from "@web/components/HomeHeader"
import styles from "@web/styles/index.module.css"
import classNames from "classnames"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { TbArrowBigRightFilled, TbBrain, TbBrandGithub, TbBrandGmail, TbClock, TbCloudComputing, TbDatabaseImport, TbForms, TbHandClick, TbWebhook } from "react-icons/tb"


export default function IndexPage() {

    const { scrollY } = useScroll()
    const box1X = useTransform(scrollY, [0, 600], [-50, 0])
    const box2X = useTransform(scrollY, [0, 600], [30, 0])

    return (<>
        <div className={classNames("h-[65rem] bg-dark-900 overflow-hidden", styles.heroContainer)}>
            <HomeHeader />

            <div className="mt-36 flex flex-col items-center gap-6 max-w-screen-lg mx-auto">
                <Title order={1} className="text-white text-center text-8xl">
                    Automation scripts for everyone
                </Title>

                <Text className="text-gray-300 text-3xl">
                    The easiest way to deploy automation scripts in the cloud
                </Text>

                <Space h="xs" />

                <Button
                    size="xl" rightIcon={<TbArrowBigRightFilled />}
                    component={Link} href="/create"
                >
                    Make your first Script
                </Button>

                <Space h="xs" />

                <div className="w-full relative">
                    <img
                        src="/code-editor.png"
                        className="w-full pt-xs bg-white rounded-lg invert"
                    />

                    <motion.div
                        animate={{ opacity: [1, 0, 0, 1] }}
                        transition={{
                            repeat: Infinity, repeatType: "loop", duration: 0.8, repeatDelay: 0.4,
                            times: [0, 0.1, 0.9, 1],
                        }}
                        className="w-[2px] h-4 bg-gray-400 absolute top-[13.25rem] left-[11.25rem]"
                    ></motion.div>

                    <HeroTriggerCard
                        motionStyle={{ x: box1X }}
                        className="-right-20 -top-10"
                        icon={TbClock}
                        title="Schedule"
                        subtitle="Every 30 minutes"
                    />
                    <HeroTriggerCard
                        motionStyle={{ x: box2X }}
                        className="-left-20 top-24"
                        icon={TbWebhook}
                        title="Webhook"
                        subtitle="Asyncronous URL"
                    />
                </div>
            </div>
        </div>

        <div className="bg-dark-900 flex flex-col items-center px-xl py-[8rem]">
            <Group className="max-w-screen-lg gap-10">
                <Stack className="flex-1">
                    <Text className="text-dark-100 tracking-widest uppercase">
                        The Problem
                    </Text>
                    <Text className="text-gray-300 text-2xl font-mono">
                        Modern AI empowers us to generate code easily, but deployment? That&apos;s often a stumbling block, especially for small and medium-sized businesses.
                    </Text>
                </Stack>

                <Stack className="flex-1 bg-dark-700 p-[4rem] rounded-xl">
                    <Group>
                        <div className="relative">
                            <div className="w-3 aspect-square bg-orange-300 rounded-full animate-ping"></div>
                            <div className="w-full h-full bg-orange absolute top-0 left-0 rounded-full"></div>
                        </div>
                        <Text className="text-dark-100 tracking-widest uppercase">
                            The Solution
                        </Text>
                    </Group>
                    <Text className="text-white text-2xl font-mono">
                        An incredibly <span className="text-primary">simple but powerful</span> platform, enabling anyone to deploy their code in the cloud, with just <span className="text-primary">a few clicks</span>.
                    </Text>
                </Stack>
            </Group>
        </div>

        <div className="h-[300vh]">
            <Stack spacing={0} py="4rem" className="max-w-screen-lg mx-auto">
                <FeatureSection
                    title="Dead simple deployment"
                    icon={TbCloudComputing}
                >
                    Write your code in our built-in editor (or paste it in from ChatGPT!), and hit save. Boom. Your code is now deployed in the cloud, and ready to run.
                </FeatureSection>

                <FeatureSection
                    title="Choose when and how your script will be triggered"
                    icon={TbHandClick}
                    reverse
                >
                    Scripts are run in response to events. You can choose to run your script:
                    <Stack spacing="xs" ml="xl" mt="xs">
                        <Group>
                            <TbClock />
                            <Text>On a schedule</Text>
                        </Group>
                        <Group>
                            <TbWebhook />
                            <Text>When a webhook is received</Text>
                        </Group>
                        <Group>
                            <TbBrandGmail />
                            <Text>When you receive an email</Text>
                            <Badge>Coming Soon</Badge>
                        </Group>
                        <Group>
                            <TbForms />
                            <Text>When a form is submitted</Text>
                            <Badge>Coming Soon</Badge>
                        </Group>
                    </Stack>
                </FeatureSection>

                <FeatureSection
                    title="AI-assisted code generation"
                    icon={TbBrain}
                    comingSoon
                >
                    Let the AI do the heavy lifting. We&apos;ll generate the code for you, and you can tweak it to your liking.
                </FeatureSection>

                <FeatureSection
                    title="Stay in sync with your codebase"
                    icon={TbBrandGithub}
                    comingSoon
                    reverse
                >
                    We&apos;ll automatically sync your code with your GitHub repository, so you can keep working in your favorite editor. The best tool is the one you don&apos;t have to use!
                </FeatureSection>

                <FeatureSection
                    title="Keep track of your data"
                    icon={TbDatabaseImport}
                    comingSoon
                >
                    Each script comes with a dedicated key-value store, so you can store state between runs.
                </FeatureSection>
            </Stack>
        </div>
    </>
    )
}


function HeroTriggerCard({ motionStyle, className, icon: Icon, title, subtitle }) {

    return (
        <motion.div
            className={classNames("bg-white px-xl py-sm rounded-lg absolute shadow-2xl", className)}
            style={motionStyle}
        >
            <Group noWrap>
                <Icon className="text-2xl" />
                <Stack spacing="xs">
                    <div>
                        <Text fw="bold">{title}</Text>
                        <Text fz="sm" color="dimmed">{subtitle}</Text>
                    </div>
                    <Group>
                        <Skeleton w={10} h={8} radius="xl" />
                        <Skeleton w={30} h={8} radius="xl" />
                    </Group>
                </Stack>
            </Group>
        </motion.div>
    )
}


function FeatureSection({ title, children, icon: Icon, graphic, comingSoon = false, reverse = false }) {

    return (
        <Group className={classNames({
            "flex-row-reverse": reverse,
        })}>
            <Stack spacing="md" className="flex-1">
                <Group>
                    <Title order={3} className="text-3xl">
                        {title}
                    </Title>
                    {comingSoon &&
                        <Badge size="xl">Coming Soon</Badge>}
                </Group>
                <Text color="dimmed" className="text-lg">
                    {children}
                </Text>
            </Stack>
            <div className="flex-1 flex justify-center">
                {graphic || Icon &&
                    <Center className={classNames("group text-8xl w-3/4 aspect-square rounded-full", styles.featureGradient)}>
                        <Center className="shadow-xl rounded-full aspect-square p-[3rem] text-violet bg-violet-200 group-hover:scale-110 transition-transform">
                            <Icon />
                        </Center>
                    </Center>}
            </div>
        </Group>
    )
}