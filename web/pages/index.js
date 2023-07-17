import { Anchor, Badge, Button, Center, Group, List, Skeleton, Space, Stack, Text, ThemeIcon, Title } from "@mantine/core"
import HomeHeader, { HomeBrand } from "@web/components/HomeHeader"
import NavLink from "@web/components/NavLink"
import ScriptListPopover from "@web/components/ScriptListPopover"
import { useScriptCount } from "@web/modules/firebase/use-my-scripts"
import styles from "@web/styles/index.module.css"
import classNames from "classnames"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { TbArrowBigRightFilled, TbBrain, TbBrandGithub, TbBrandGmail, TbCheck, TbClock, TbCloudComputing, TbDatabaseImport, TbForms, TbHandClick, TbScriptPlus, TbWebhook } from "react-icons/tb"


export default function IndexPage() {

    const { scrollY } = useScroll()
    const box1X = useTransform(scrollY, [0, 600], [-50, 0])
    const box2X = useTransform(scrollY, [0, 600], [30, 0])

    const [scriptCount] = useScriptCount()
    const isFirstTime = (scriptCount ?? 0) == 0

    return (<>
        <div className={classNames("h-screen md:h-[65rem] bg-dark-900 overflow-hidden", styles.heroContainer)}>
            <HomeHeader firstTime={isFirstTime} />

            <div className="mt-36 flex flex-col items-center gap-6 max-w-screen-lg mx-auto">
                <Title order={1} className="text-white text-center text-5xl lg:text-8xl">
                    Automation scripts for everyone
                </Title>

                <Text className="text-gray-300 text-xl lg:text-3xl text-center">
                    The easiest way to deploy automation scripts in the cloud
                </Text>

                <Space h="xs" />

                {isFirstTime ?
                    <Button
                        size="xl" rightIcon={<TbArrowBigRightFilled />}
                        component={Link} href="/create"
                    >
                        Make your first Script
                    </Button> :
                    <Group position="center">
                        <Button
                            size="lg" rightIcon={<TbScriptPlus />} variant="white"
                            component={Link} href="/create"
                        >
                            Create a Script
                        </Button>
                        <Button
                            size="lg" rightIcon={<TbArrowBigRightFilled />}
                            component={Link} href="/scripts"
                        >
                            Go to Scripts
                        </Button>
                    </Group>}

                <Space h="xs" />

                <div className="w-full relative hidden md:block">
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

        {/* <div className="bg-dark-900 flex flex-col items-center px-xl py-[8rem]">
            <Group className="max-w-screen-lg gap-10">
                <Stack className="flex-1">
                    <Text className="text-dark-100 tracking-widest uppercase">
                        The Problem
                    </Text>
                    <Text className="text-gray-300 text-2xl font-mono">
                        Modern AI empowers us to generate code easily but deploying that code is a daunting task, especially businesses without existing cloud architecture.
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
        </div> */}

        <div className="bg-dark-900 px-xl py-12 border-0 border-b-8 border-solid border-primary">
            <Stack className="max-w-screen-lg mx-auto" spacing="xl">
                <Text className="text-white font-mono text-3xl text-center">
                    LittleScript is a <span className="text-primary">shockingly simple</span> platform for deploying automation scripts in the cloud.
                </Text>
                <Group position="center" spacing="xl">
                    <Step number={1} size="xl">
                        Write your code
                    </Step>
                    <Step number={2} size="xl">
                        Pick a trigger
                    </Step>
                    <Step number={3} size="xl" emph>
                        Sit back and relax
                    </Step>
                </Group>
            </Stack>
        </div>

        <div id="features" className="px-xl">
            <Stack py="4rem" className="max-w-screen-lg mx-auto gap-12 md:gap-0">
                <FeatureSection
                    title="Dead-simple deployment"
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
                    We&apos;ll automatically deploy code from your GitHub repository, so you can keep working in your favorite editor. The best tool is the one you don&apos;t have to use!
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

        <div>
            <div className={classNames(
                "max-w-screen-lg mx-auto md:rounded-xl bg-dark-900 px-xl md:px-16 py-24 relative overflow-hidden",
                styles.ctaContainer,
            )}>
                <img
                    src="/code-editor.png"
                    className="w-3/4 invert rounded-lg absolute left-2/3 top-20 px-xs py-md bg-white hidden md:block"
                />

                <Group>
                    <Stack align="flex-start" className="flex-1 max-w-1/2">
                        <Text className="text-5xl font-bold text-white">
                            Ready to get started?
                        </Text>
                        <Text className="text-xl text-gray-300">
                            You don&apos;t even need to sign up.
                        </Text>
                        <Button
                            component={Link} href="/create"
                            size="xl" rightIcon={<TbArrowBigRightFilled />}
                        >
                            Make your first Script
                        </Button>
                    </Stack>
                </Group>
            </div>
        </div>

        <Stack className="px-xs md:px-xl py-20" spacing="3rem" id="pricing">
            <div className="flex flex-col gap-2 max-w-screen-sm self-center">
                <Title order={2} className="text-4xl text-center">Pricing</Title>
                <Text ta="center">
                    LittleScript is free to use for personal projects. For businesses, we offer a simple pay-as-you-go model.
                </Text>

            </div>

            <Group className="max-w-screen-lg mx-auto" position="center" spacing="4rem">
                <PricingCard
                    title="Free"
                    description="Best for hobbyists and personal projects."
                    features={[
                        "Up to 100 runs per month",
                        "0.5GB RAM, 0.5 CPU per run",
                    ]}
                >
                    <Button
                        component={Link} href="/create"
                        size="lg" className="hidden md:block"
                    >
                        Create a Free Script
                    </Button>
                    <Button
                        component={Link} href="/create"
                        size="sm" className="md:hidden"
                    >
                        Create a Free Script
                    </Button>
                </PricingCard>

                <PricingCard
                    title="Little"
                    description="For businesses optimizing operations."
                    features={[
                        "Unlimited runs per month",
                        "1GB RAM, 1 CPU per run",
                    ]}
                    emph
                    color="violet"
                >
                    <div>
                        <Text className="text-4xl text-white font-medium">$0.01</Text>
                        <Text color="dimmed">per run</Text>
                    </div>
                    <ScriptListPopover tab="billing">
                        <Button
                            size="lg"
                            color="violet"
                            className="hidden md:block"
                        >
                            Upgrade a Script to Get Started
                        </Button>
                        <Button
                            size="sm"
                            color="violet"
                            className="md:hidden"
                        >
                            Upgrade a Script to Get Started
                        </Button>
                    </ScriptListPopover>
                </PricingCard>
            </Group>

            <Text ta="center" color="dimmed">
                Pricing is per script.
            </Text>
        </Stack>

        <Space h="4rem" />

        <div className="bg-dark-900 px-xl py-20">
            <Stack className="max-w-screen-lg mx-auto">
                <Group position="apart" align="flex-start">
                    <Stack align="flex-start" spacing="xs">
                        <HomeBrand />
                        <Text color="dimmed" className="text-lg">
                            The easiest way to deploy automation scripts in the cloud.
                        </Text>
                    </Stack>

                    <Stack spacing="xl" align="flex-end">
                        <Group>
                            <NavLink href="/" color="white">Home</NavLink>
                            <NavLink href="#pricing" color="white">Pricing</NavLink>
                            <Button
                                variant="white" ml="xl"
                                component={Link} href="/scripts"
                                className="hover:bg-primary hover:text-white transition-colors"
                            >
                                Start for Free
                            </Button>
                        </Group>

                        <Group>
                            <Text color="dimmed">
                                Questions, comments, or concerns? Shoot us an <Anchor href="mailto:info@littlescript.io">
                                    email.
                                </Anchor>
                            </Text>
                        </Group>
                    </Stack>
                </Group>
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
                    <Group noWrap className="md:hidden">
                        <Icon className="text-4xl text-violet" />
                        <Title order={3} className="text-2xl flex-1">
                            {title}
                        </Title>
                    </Group>

                    <Title order={3} className="text-3xl hidden md:block">
                        {title}
                    </Title>

                    {comingSoon &&
                        <Badge size="xl">Coming Soon</Badge>}
                </Group>
                <Text color="dimmed" className="text-lg">
                    {children}
                </Text>
            </Stack>
            <div className="flex-1 justify-center hidden md:flex">
                {graphic || Icon &&
                    <Center className={classNames("group text-8xl w-3/4 aspect-square rounded-full", styles.featureGradient)}>
                        <Center className="shadow-xl rounded-full aspect-square p-[3rem] text-violet-500 bg-dark-600 group-hover:scale-110 transition-transform">
                            <Icon />
                        </Center>
                    </Center>}
            </div>
        </Group>
    )
}


function Step({ number, children, size, emph }) {

    return (
        <Group spacing="md">
            <ThemeIcon size={size} radius="xl" color="dark" className="font-mono">
                {number}
            </ThemeIcon>
            <Text size={size} fw={emph ? "bold" : "normal"} color={emph ? "white" : "gray.3"}>
                {children}
            </Text>
        </Group>
    )
}


function PricingCard({ title, description, features, children, color, emph }) {

    return (
        <div className={classNames({
            "rounded-xl shadow-lg p-12": true,
            "bg-dark-900 md:scale-110": emph,
            [styles.ctaContainer]: emph,
        })}>
            <Stack spacing="xl">
                <Stack>
                    <Title
                        order={3}
                        className={classNames({
                            "text-3xl": true,
                            "text-white": emph,
                        })}
                    >
                        {title}
                    </Title>
                    <Text color="dimmed">
                        {description}
                    </Text>
                </Stack>
                {children}
                <List
                    icon={<ThemeIcon color={color}>
                        <TbCheck />
                    </ThemeIcon>}
                    spacing="xs"
                    className={classNames({
                        "text-white font-medium": emph,
                    })}
                >
                    {features.map((feature, i) =>
                        <List.Item key={i}>
                            {feature}
                        </List.Item>
                    )}
                </List>
            </Stack>
        </div>
    )
}